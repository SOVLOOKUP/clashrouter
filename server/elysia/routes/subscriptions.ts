import { Elysia } from 'elysia'
import prisma from '../../utils/prisma'
import { nanoid } from 'nanoid'

interface CreateSubscriptionBody {
  name: string
  description?: string
  airportIds?: string[]
  config?: unknown
}

interface UpdateSubscriptionBody {
  name?: string
  description?: string
  airportIds?: string[]
  config?: unknown
}

export const subscriptionRoutes = new Elysia({ prefix: '/subscriptions' })
// 获取所有订阅列表
  .get('/', async () => {
    try {
      const subscriptions = await prisma.subscription.findMany({
        include: {
          airports: true
        },
        orderBy: { createdAt: 'desc' }
      })
      return { success: true, data: subscriptions }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '未知错误'
      return { success: false, error: message }
    }
  })

// 获取单个订阅详情
  .get('/:id', async ({ params: { id } }) => {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { id },
        include: {
          airports: true
        }
      })

      if (!subscription) {
        return { success: false, error: '订阅不存在' }
      }

      return { success: true, data: subscription }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '未知错误'
      return { success: false, error: message }
    }
  })

// 创建订阅
  .post('/', async ({ body }) => {
    try {
      const { name, description, airportIds, config } = body as CreateSubscriptionBody

      const token = nanoid(16)

      const subscription = await prisma.subscription.create({
        data: {
          name,
          description,
          token,
          config: config ? JSON.stringify(config) : null,
          airports: airportIds && Array.isArray(airportIds) && airportIds.length > 0
            ? {
                connect: airportIds.map((airportId: string) => ({ id: airportId }))
              }
            : undefined
        }
      })

      return { success: true, data: subscription }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '未知错误'
      return { success: false, error: message }
    }
  })

// 更新订阅
  .put('/:id', async ({ params: { id }, body }) => {
    try {
      const { name, description, airportIds, config } = body as UpdateSubscriptionBody

      const subscription = await prisma.subscription.update({
        where: { id },
        data: {
          name,
          description,
          config: config ? JSON.stringify(config) : null,
          airports: airportIds && Array.isArray(airportIds)
            ? {
                set: airportIds.map((airportId: string) => ({ id: airportId }))
              }
            : undefined
        }
      })

      return { success: true, data: subscription }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '未知错误'
      return { success: false, error: message }
    }
  })

// 删除订阅
  .delete('/:id', async ({ params: { id } }) => {
    try {
      await prisma.subscription.delete({
        where: { id }
      })
      return { success: true, message: '删除成功' }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '未知错误'
      return { success: false, error: message }
    }
  })

// 重新生成订阅 token
  .post('/:id/regenerate-token', async ({ params: { id } }) => {
    try {
      const token = nanoid(16)

      const subscription = await prisma.subscription.update({
        where: { id },
        data: { token }
      })

      return { success: true, data: subscription }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '未知错误'
      return { success: false, error: message }
    }
  })
