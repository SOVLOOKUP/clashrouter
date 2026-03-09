import { Elysia } from 'elysia'
import { z, ZodError } from 'zod'
import prisma from '../../utils/prisma'
import { updateAirportNodes, updateAllAirports } from '../../services/updateService'
import { getPlugin, type PluginConfigMode } from '../../airport-plugins'

function isBlank(value?: string) {
  return !value || value.trim() === ''
}

const idParamSchema = z.object({
  id: z.string().trim().min(1, '机场 ID 不能为空')
})

const optionalTextSchema = z.union([z.string(), z.null(), z.undefined()])

const createAirportSchema = z.object({
  name: z.string().trim().min(1, '机场名称不能为空'),
  pluginType: z.string().trim().min(1, '插件类型不能为空'),
  username: optionalTextSchema,
  password: optionalTextSchema,
  subUrl: optionalTextSchema,
  host: optionalTextSchema,
  updateFrequency: z.number().int().min(1, '更新频率必须大于 0').optional()
})

const updateAirportSchema = z.object({
  name: z.string().trim().min(1, '机场名称不能为空').optional(),
  pluginType: z.string().trim().min(1, '插件类型不能为空').optional(),
  username: optionalTextSchema,
  password: optionalTextSchema,
  subUrl: optionalTextSchema,
  host: optionalTextSchema,
  updateFrequency: z.number().int().min(1, '更新频率必须大于 0').optional(),
  status: z.string().trim().min(1, '状态不能为空').optional()
})

function normalizeOptionalText(value: string | null | undefined): string | undefined {
  if (value === null || value === undefined) {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

function getErrorMessage(error: unknown) {
  if (error instanceof ZodError) {
    return error.issues[0]?.message || '请求参数校验失败'
  }

  if (error instanceof Error) {
    return error.message
  }

  return '请求失败'
}

function hasValidCredentialInput(
  mode: PluginConfigMode,
  subUrl?: string,
  username?: string,
  password?: string
) {
  const hasSubUrl = !isBlank(subUrl)
  const hasUsername = !isBlank(username)
  const hasPassword = !isBlank(password)

  if (mode === 'subUrl') {
    return hasSubUrl
  }

  if (mode === 'credentials') {
    return hasUsername && hasPassword
  }

  return hasSubUrl || (hasUsername && hasPassword)
}

function hasBoundCredentialPair(username?: string, password?: string) {
  const hasUsername = !isBlank(username)
  const hasPassword = !isBlank(password)
  return hasUsername === hasPassword
}

function getCredentialValidationMessage(mode: PluginConfigMode) {
  if (mode === 'subUrl') {
    return '当前插件需要填写 subUrl'
  }

  if (mode === 'credentials') {
    return '当前插件需要同时填写用户名和密码'
  }

  return 'subUrl 与用户名/密码需二选一：要么填写 subUrl，要么同时填写用户名和密码'
}

function isHttpsHost(value?: string) {
  return !value || value.startsWith('http')
}

export const airportRoutes = new Elysia({ prefix: '/airports' })
// 获取所有机场列表
  .get('/', async () => {
    try {
      const airports = await prisma.airport.findMany({
        orderBy: { createdAt: 'desc' }
      })
      return { success: true, data: airports }
    } catch (error: unknown) {
      return { success: false, error: getErrorMessage(error) }
    }
  })

// 获取单个机场详情
  .get('/:id', async ({ params }) => {
    try {
      const { id } = idParamSchema.parse(params)
      const airport = await prisma.airport.findUnique({
        where: { id }
      })
      if (!airport) {
        return { success: false, error: '机场不存在' }
      }
      return { success: true, data: airport }
    } catch (error: unknown) {
      return { success: false, error: getErrorMessage(error) }
    }
  })

// 创建机场
  .post('/', async ({ body }: { body: unknown }) => {
    try {
      console.log('📥 POST /airports received:', JSON.stringify(body, null, 2))
      const parsedBody = createAirportSchema.parse(body)
      console.log('✅ Schema validation passed')
      const name = parsedBody.name.trim()
      const pluginType = parsedBody.pluginType.trim()
      const username = normalizeOptionalText(parsedBody.username)
      const password = normalizeOptionalText(parsedBody.password)
      const subUrl = normalizeOptionalText(parsedBody.subUrl)
      const host = normalizeOptionalText(parsedBody.host)
      console.log('📊 Normalized fields:', { name, pluginType, username, password, subUrl, host })

      const plugin = pluginType ? getPlugin(pluginType) : undefined
      if (!pluginType || !plugin) {
        return { success: false, error: '请选择有效的插件类型' }
      }

      if (!hasBoundCredentialPair(username, password)) {
        return { success: false, error: '用户名和密码必须同时填写或同时留空' }
      }

      if (!hasValidCredentialInput(plugin.type, subUrl, username, password)) {
        return { success: false, error: getCredentialValidationMessage(plugin.type) }
      }

      if (pluginType === 'xboard' && !isHttpsHost(host)) {
        return { success: false, error: 'Xboard host 必须以 https:// 开头' }
      }

      // 创建机场
      const airport = await prisma.airport.create({
        data: {
          name,
          pluginType,
          username: isBlank(username) ? null : username,
          password: isBlank(password) ? null : password,
          subUrl: isBlank(subUrl) ? null : subUrl,
          host: isBlank(host) ? null : host,
          updateFrequency: parsedBody.updateFrequency || 60
        }
      })

      // 多奚算法更新节点（不阻塞）
      updateAirportNodes(airport.id).catch((error: unknown) => {
        console.error(`Failed to update nodes for airport ${airport.id}:`, getErrorMessage(error))
      })

      return { success: true, data: airport }
    } catch (error: unknown) {
      return { success: false, error: getErrorMessage(error) }
    }
  })

// 更新机场
  .put('/:id', async ({ params, body }: { params: unknown, body: unknown }) => {
    try {
      const { id } = idParamSchema.parse(params)
      const parsedBody = updateAirportSchema.parse(body)

      const currentAirport = await prisma.airport.findUnique({ where: { id } })
      if (!currentAirport) {
        return { success: false, error: '机场不存在' }
      }

      const pluginType = parsedBody.pluginType?.trim()
      const finalPluginType = pluginType || currentAirport.pluginType
      const plugin = getPlugin(finalPluginType)
      if (!plugin) {
        return { success: false, error: '插件类型无效' }
      }

      const username = normalizeOptionalText(parsedBody.username)
      const password = normalizeOptionalText(parsedBody.password)
      const subUrl = normalizeOptionalText(parsedBody.subUrl)
      const host = normalizeOptionalText(parsedBody.host)

      // 更新时用最终值做校验，避免部分字段更新造成误判
      const finalSubUrl = subUrl ?? (currentAirport.subUrl ?? undefined)
      const finalUsername = username ?? (currentAirport.username ?? undefined)
      const finalPassword = password ?? (currentAirport.password ?? undefined)

      if (!hasBoundCredentialPair(finalUsername, finalPassword)) {
        return { success: false, error: '用户名和密码必须同时填写或同时留空' }
      }

      if (!hasValidCredentialInput(plugin.type, finalSubUrl, finalUsername, finalPassword)) {
        return { success: false, error: getCredentialValidationMessage(plugin.type) }
      }

      const finalHost = host ?? (currentAirport.host ?? undefined)
      if (finalPluginType === 'xboard' && !isHttpsHost(finalHost)) {
        return { success: false, error: 'Xboard host 必须以 https:// 开头' }
      }

      const airport = await prisma.airport.update({
        where: { id },
        data: {
          name: parsedBody.name?.trim(),
          pluginType,
          username: isBlank(username) ? null : username,
          password: isBlank(password) ? null : password,
          subUrl: isBlank(subUrl) ? null : subUrl,
          host: isBlank(host) ? null : host,
          updateFrequency: parsedBody.updateFrequency,
          status: parsedBody.status
        }
      })

      return { success: true, data: airport }
    } catch (error: unknown) {
      return { success: false, error: getErrorMessage(error) }
    }
  })

// 删除机场
  .delete('/:id', async ({ params }) => {
    try {
      const { id } = idParamSchema.parse(params)
      await prisma.airport.delete({
        where: { id }
      })

      return { success: true, message: '删除成功' }
    } catch (error: unknown) {
      return { success: false, error: getErrorMessage(error) }
    }
  })

// 手动触发机场更新
  .post('/:id/update', async ({ params }) => {
    try {
      const { id } = idParamSchema.parse(params)
      const result = await updateAirportNodes(id)
      if (result.success) {
        return { success: true, message: `成功更新 ${result.nodeCount} 个节点` }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error: unknown) {
      return { success: false, error: getErrorMessage(error) }
    }
  })

// 更新所有机场
  .post('/batch/update-all', async () => {
    try {
      const results = await updateAllAirports()
      const successCount = results.filter(r => r.success).length
      const totalNodes = results.reduce((sum, r) => sum + (r.nodeCount || 0), 0)

      return {
        success: true,
        message: `成功更新 ${successCount} 个机场，新增 ${totalNodes} 个节点`,
        results
      }
    } catch (error: unknown) {
      return { success: false, error: getErrorMessage(error) }
    }
  })
