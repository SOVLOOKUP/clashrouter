import { Elysia } from 'elysia'
import { convertSubscription, getSubscriptionContent } from '../../services/subscriptionService'

function getSubscriptionErrorStatus(errorMessage?: string): number {
  if (!errorMessage) return 400

  // 订阅不存在或订阅无可用节点，按资源不存在返回 404
  if (errorMessage.includes('订阅不存在') || errorMessage.includes('订阅中没有可用节点')) {
    return 404
  }

  return 400
}

export const subscriptionServerRoutes = new Elysia({ prefix: '/sub' })
// 获取订阅内容
  .get('/:token', async ({ params: { token }, query }: any) => {
    try {
      const target = query.target || 'clash'
      const config = query.config || ''
      const airportId = query.airportId || ''

      // 如果 target 是 base64，直接返回 base64 内容
      if (target === 'base64' || target === 'mixed') {
        const result = await getSubscriptionContent(token, target, airportId || undefined)

        if (!result.success) {
          return new Response(result.error || '订阅转换失败', {
            status: getSubscriptionErrorStatus(result.error),
            headers: {
              'Content-Type': 'text/plain; charset=utf-8'
            }
          })
        }

        return new Response(result.content, {
          status: 200,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'X-Content-Type-Options': 'nosniff',
            'Subscription-Userinfo': `upload=0; download=0; total=0; expire=0`,
            'Profile-Update-Interval': '24'
          }
        })
      }

      const result = await convertSubscription(token, target, config)

      if (!result.success) {
        return new Response(result.error || '订阅转换失败', {
          status: getSubscriptionErrorStatus(result.error),
          headers: {
            'Content-Type': 'text/plain; charset=utf-8'
          }
        })
      }

      return new Response(result.content, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'X-Content-Type-Options': 'nosniff',
          'Subscription-Userinfo': `upload=0; download=0; total=0; expire=0`,
          'Profile-Update-Interval': '24'
        }
      })
    } catch (error: any) {
      return new Response(error.message, {
        status: 500,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8'
        }
      })
    }
  })
