import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { airportRoutes } from './server/elysia/routes/airports'
import { subscriptionRoutes } from './server/elysia/routes/subscriptions'
import { pluginRoutes } from './server/elysia/routes/plugins'
import { subscriptionServerRoutes } from './server/elysia/routes/subscription-server'
import { scheduler } from './server/services/schedulerService'
import { initializePlugins } from './server/airport-plugins/loader'

let bootstrapped = false

async function initializeDatabase() {
  // 数据库初始化 - 插件由代码维护
}

async function bootstrap() {
  if (bootstrapped) return

  initializePlugins()
  await initializeDatabase()
  scheduler.start()
  bootstrapped = true
}

export default async function createElysiaApp() {
  await bootstrap()

  return new Elysia()
    .use(cors({
      origin: true,
      credentials: true
    }))
    .get('/health', () => ({ status: 'ok', timestamp: new Date().toISOString() }))
    .use(airportRoutes)
    .use(subscriptionRoutes)
    .use(pluginRoutes)
    .use(subscriptionServerRoutes)
    .post('/system/trigger-update', async () => {
      const results = await scheduler.triggerUpdate()
      return { success: true, results }
    })
}
