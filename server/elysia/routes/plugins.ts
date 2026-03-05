import { Elysia } from 'elysia'
import { z, ZodError } from 'zod'
import { getAllPlugins, getPlugin } from '../../airport-plugins'

const pluginIdParamSchema = z.object({
  id: z.string().trim().min(1, '插件 ID 不能为空')
})

function getErrorMessage(error: unknown) {
  if (error instanceof ZodError) {
    return error.issues[0]?.message || '请求参数校验失败'
  }

  if (error instanceof Error) {
    return error.message
  }

  return '请求失败'
}

export const pluginRoutes = new Elysia({ prefix: '/plugins' })
  // 获取所有已注册插件（由代码维护）
  .get('/', async () => {
    try {
      const plugins = getAllPlugins().map(plugin => ({
        id: plugin.id,
        name: plugin.name,
        description: plugin.description,
        type: plugin.type,
        enabled: true
      }))

      return { success: true, data: plugins }
    } catch (error: unknown) {
      return { success: false, error: getErrorMessage(error) }
    }
  })

  // 获取单个插件详情
  .get('/:id', async ({ params }) => {
    try {
      const { id } = pluginIdParamSchema.parse(params)
      const plugin = getPlugin(id)
      if (!plugin) {
        return { success: false, error: '插件不存在' }
      }

      return {
        success: true,
        data: {
          id: plugin.id,
          name: plugin.name,
          description: plugin.description,
          type: plugin.type,
          enabled: true
        }
      }
    } catch (error: unknown) {
      return { success: false, error: getErrorMessage(error) }
    }
  })

  // 插件由代码维护，不支持运行时增删改
  .post('/', () => ({ success: false, error: '插件由代码维护，不支持运行时创建' }))
  .put('/:id', () => ({ success: false, error: '插件由代码维护，不支持运行时更新' }))
  .delete('/:id', () => ({ success: false, error: '插件由代码维护，不支持运行时删除' }))
  .post('/:id/toggle', () => ({ success: false, error: '插件由代码维护，不支持运行时切换' }))
