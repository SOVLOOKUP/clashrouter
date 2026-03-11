import ky from 'ky'
import prisma from '../utils/prisma'

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return '未知错误'
}

type SubscriptionAirportNodes = {
  airportId: string
  airportName: string
  nodes: string[]
}

type SubscriptionAirportsResult = {
  success: boolean
  airports?: SubscriptionAirportNodes[]
  error?: string
}

type SubscriptionContentResult = {
  success: boolean
  content?: string
  nodeCount?: number
  error?: string
}

function normalizeProviderName(name: string): string {
  const sanitized = name.trim().replace(/[|,]/g, '_')
  return sanitized || 'Provider'
}

function encodeNodesToBase64(nodes: string[]): string {
  const nodeLinks = nodes.join('\n')
  return Buffer.from(nodeLinks).toString('base64')
}

function normalizeBaseUrl(raw: string): string {
  return raw.trim().replace(/\/+$/, '')
}

function getCallbackBaseUrl(): string {
  // For external SubConverter services, this must be a publicly reachable URL.
  const envBaseUrl
    = process.env.SUB_CALLBACK_URL
      || process.env.PUBLIC_BASE_URL
      || process.env.APP_URL
      || process.env.SITE_URL

  if (envBaseUrl && envBaseUrl.trim()) {
    return normalizeBaseUrl(envBaseUrl)
  }

  const port = process.env.PORT || '3000'
  return `http://127.0.0.1:${port}`
}

function toNodeLinks(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string')
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed)
        ? parsed.filter((item): item is string => typeof item === 'string')
        : []
    } catch {
      return []
    }
  }

  return []
}

async function getSubscriptionAirports(token: string): Promise<SubscriptionAirportsResult> {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { token },
      include: {
        airports: true
      }
    })

    if (!subscription) {
      return {
        success: false,
        error: '订阅不存在'
      }
    }

    const airports = subscription.airports
      .map((airport) => {
        const nodes = toNodeLinks(airport.nodesJson)
        return {
          airportId: airport.id,
          airportName: airport.name,
          nodes
        }
      })
      .filter(airport => airport.nodes.length > 0)

    if (airports.length === 0) {
      return {
        success: false,
        error: '订阅中没有可用节点'
      }
    }

    return {
      success: true,
      airports
    }
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error)
    }
  }
}

// 获取订阅内容
export async function getSubscriptionContent(
  token: string,
  _target: string = 'clash',
  airportId?: string
): Promise<SubscriptionContentResult> {
  try {
    const airportsResult = await getSubscriptionAirports(token)
    if (!airportsResult.success || !airportsResult.airports) {
      return {
        success: false,
        error: airportsResult.error || '订阅中没有可用节点'
      }
    }

    const selectedAirports = airportId
      ? airportsResult.airports.filter(airport => airport.airportId === airportId)
      : airportsResult.airports

    const allNodes = selectedAirports.flatMap(airport => airport.nodes)

    if (allNodes.length === 0) {
      return {
        success: false,
        error: '订阅中没有可用节点'
      }
    }

    // 将节点链接转换为 base64 编码格式
    const base64Content = encodeNodesToBase64(allNodes)

    return {
      success: true,
      content: base64Content,
      nodeCount: allNodes.length
    }
  } catch (error: unknown) {
    console.error('Failed to get subscription content:', getErrorMessage(error))
    return {
      success: false,
      error: getErrorMessage(error)
    }
  }
}

// 通过 SubConverter 转换订阅
export async function convertSubscription(
  token: string,
  target: string = 'clash',
  config?: string
) {
  try {
    // 获取订阅的所有机场及其节点
    const airportsResult = await getSubscriptionAirports(token)
    if (!airportsResult.success || !airportsResult.airports) {
      return {
        success: false,
        error: airportsResult.error || '订阅中没有可用节点'
      }
    }

    // 仅用于统计节点数量和失败兜底（base64 返回）
    const allNodes = airportsResult.airports.flatMap(airport => airport.nodes)

    // 将每个机场转换为可回调的订阅链接，避免 URL 因节点过多而超长
    const callbackBaseUrl = getCallbackBaseUrl()
    const allSubscriptionUrlsWithProvider: string[] = []
    for (const airport of airportsResult.airports) {
      const providerName = normalizeProviderName(airport.airportName)
      const callbackQuery = new URLSearchParams({
        target: 'base64',
        airportId: airport.airportId
      })
      const callbackUrl = `${callbackBaseUrl}/_api/sub/${token}?${callbackQuery.toString()}`
      allSubscriptionUrlsWithProvider.push(`provider:${providerName},${callbackUrl}`)
    }

    if (allNodes.length === 0) {
      return {
        success: false,
        error: '订阅中没有可用节点'
      }
    }

    const subConverterUrl = process.env.SUB_CONVERTER_URL || 'https://api.asailor.org'
    const configUrl = process.env.SUB_CONVERTER_CONFIG_URL || 'https://testingcf.jsdelivr.net/gh/Aethersailor/Custom_OpenClash_Rules@refs/heads/main/cfg/Custom_Clash_Full.ini'

    try {
      // 使用回调订阅链接让 SubConverter 拉取内容，避免超长 URL。
      const query = new URLSearchParams({
        config: configUrl,
        target,
        url: allSubscriptionUrlsWithProvider.join('|')
      })

      if (config) {
        query.set('config', config)
      }

      const requestOptions = {
        headers: {
          'User-Agent': 'ClashRouter/1.0.0'
        },
        timeout: 30000,
        // Bun 特定选项 - 跳过 SSL 证书验证
        https: {
          rejectUnauthorized: false
        }
      } as unknown as Parameters<typeof ky>[1]

      const convertedContent = await ky(
        `${subConverterUrl}/sub?${query.toString()}`,
        requestOptions
      ).text()

      return {
        success: true,
        content: convertedContent,
        nodeCount: allNodes.length
      }
    } catch (converterError) {
      console.warn('SubConverter failed, falling back to base64:', converterError)

      // 如果 SubConverter 失败，返回 base64 编码的所有节点
      const base64Content = encodeNodesToBase64(allNodes)
      return {
        success: true,
        content: base64Content,
        nodeCount: allNodes.length
      }
    }
  } catch (error: unknown) {
    console.error('Failed to convert subscription:', getErrorMessage(error))
    return {
      success: false,
      error: getErrorMessage(error)
    }
  }
}
