import ky from 'ky'
import prisma from '../utils/prisma'
import { getPlugin } from '../airport-plugins/index'

function decodeSubscriptionText(content: string): string {
  try {
    const decoded = Buffer.from(content, 'base64').toString('utf-8')
    // 粗略判断是否成功解码为文本订阅
    return decoded.includes('://') || decoded.includes('\n') ? decoded : content
  } catch {
    return content
  }
}

function extractNodeLinks(content: string): string[] {
  const decoded = decodeSubscriptionText(content)
  return decoded
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
}

// 更新单个机场的节点
export async function updateAirportNodes(airportId: string) {
  try {
    const airport = await prisma.airport.findUnique({
      where: { id: airportId }
    })

    if (!airport) {
      throw new Error('机场不存在')
    }

    // 获取插件
    const plugin = getPlugin(airport.pluginType)
    if (!plugin) {
      throw new Error(`插件 ${airport.pluginType} 未找到`)
    }

    // 获取订阅链接
    const subscribeContent = await plugin.getSubscribeContent({
      username: airport.username || undefined,
      password: airport.password || undefined,
      subUrl: airport.subUrl || undefined
    })

    let content: string

    if (subscribeContent.startsWith('http')) {
      // 获取订阅内容
      content = await ky(subscribeContent, {
        timeout: 30000, // 30秒超时
        // Bun 特定选项 - 跳过 SSL 证书验证
        https: {
          rejectUnauthorized: false
        }
      } as Parameters<typeof ky>[1]).text()
    } else {
      content = subscribeContent
    }

    // 解析节点链接（统一在服务层处理）
    const nodeLinks = extractNodeLinks(content)

    // 更新机场状态和节点链接
    await prisma.airport.update({
      where: { id: airportId },
      data: {
        nodesJson: JSON.stringify(nodeLinks),
        nodeCount: nodeLinks.length,
        lastUpdateTime: new Date(),
        status: 'active',
        errorMessage: null
      }
    })

    console.log(`✅ Updated ${nodeLinks.length} nodes for airport ${airport.name}`)
    return { success: true, nodeCount: nodeLinks.length }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`❌ Failed to update airport ${airportId}:`, message)

    // 更新机场错误状态
    await prisma.airport.update({
      where: { id: airportId },
      data: {
        status: 'error',
        errorMessage: message
      }
    }).catch(() => { })

    return { success: false, error: message }
  }
}

// 更新所有需要更新的机场
export async function updateAllAirports() {
  const airports = await prisma.airport.findMany({
    where: {
      status: { not: 'inactive' }
    }
  })

  const now = new Date()
  const results = []

  for (const airport of airports) {
    // 检查是否需要更新
    if (airport.lastUpdateTime) {
      const timeSinceUpdate = now.getTime() - airport.lastUpdateTime.getTime()
      const updateInterval = airport.updateFrequency * 60 * 1000 // 转换为毫秒

      if (timeSinceUpdate < updateInterval) {
        continue // 跳过不需要更新的机场
      }
    }

    const result = await updateAirportNodes(airport.id)
    results.push({
      airportId: airport.id,
      airportName: airport.name,
      ...result
    })
  }

  return results
}
