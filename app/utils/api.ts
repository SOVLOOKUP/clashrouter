import { z } from 'zod'
import {
  airportSchema,
  subscriptionSchema,
  airportPluginSchema,
  type Airport,
  type Subscription,
  type AirportPlugin
} from '~/types/api'

interface EdanApi {
  airports: {
    get: () => Promise<unknown>
    post: (data: unknown) => Promise<unknown>
    (params: { id: string }): {
      get: () => Promise<unknown>
      put: (data: unknown) => Promise<unknown>
      delete: () => Promise<unknown>
      update: {
        post: () => Promise<unknown>
      }
    }
    batch: {
      'update-all': {
        post: () => Promise<unknown>
      }
    }
  }
  subscriptions: {
    get: () => Promise<unknown>
    post: (data: unknown) => Promise<unknown>
    (params: { id: string }): {
      'get': () => Promise<unknown>
      'put': (data: unknown) => Promise<unknown>
      'delete': () => Promise<unknown>
      'regenerate-token': {
        post: () => Promise<unknown>
      }
    }
  }
  plugins: {
    get: () => Promise<unknown>
    post: (data: unknown) => Promise<unknown>
    (params: { id: string }): {
      get: () => Promise<unknown>
      put: (data: unknown) => Promise<unknown>
      delete: () => Promise<unknown>
      toggle: {
        post: () => Promise<unknown>
      }
    }
  }
  system: {
    'trigger-update': {
      post: () => Promise<unknown>
    }
  }
}

function getApi(): EdanApi {
  const { $api } = useNuxtApp()

  if (!$api) {
    throw new Error('Eden API 客户端未注入')
  }

  return $api as EdanApi
}

function normalizeError(error: unknown): string {
  if (!error) return '请求失败'
  if (typeof error === 'string') return error
  if (error && typeof error === 'object') {
    if ('value' in error && error.value && typeof error.value === 'object' && 'message' in error.value) {
      return String(error.value.message)
    }
    if ('message' in error) return String(error.message)
  }
  return '请求失败'
}

async function unwrap<T>(request: Promise<unknown>, schema?: z.ZodSchema<T>): Promise<T> {
  let response: unknown
  try {
    response = await request
  } catch (error: unknown) {
    throw new Error(normalizeError(error))
  }

  // 处理 Eden API 格式: { data, error }
  if (response && typeof response === 'object' && 'error' in response && response.error) {
    throw new Error(normalizeError(response.error))
  }

  if (response && typeof response === 'object' && 'data' in response && 'error' in response) {
    // 这是 Eden API 格式，需要提取 data 并继续处理
    response = response.data
  }

  // 处理自定义格式: { success, data/message, error }
  if (response && typeof response === 'object' && 'success' in response) {
    const successResponse = response as { success: boolean, data?: unknown, error?: unknown, message?: unknown }
    if (!successResponse.success) {
      throw new Error(normalizeError(successResponse.error || successResponse.message) || '请求失败')
    }
    // 优先返回 data
    response = successResponse.data !== undefined ? successResponse.data : response
  }

  // 如果提供了 schema，进行验证
  if (schema) {
    const result = schema.safeParse(response)
    if (!result.success) {
      console.error('API 响应验证失败:', result.error)
      throw new Error('API 响应格式错误')
    }
    return result.data
  }

  return response as T
}

export const airportApi = {
  list: (): Promise<Airport[]> => unwrap(getApi().airports.get(), z.array(airportSchema)),
  get: (id: string): Promise<Airport> => unwrap(getApi().airports({ id }).get(), airportSchema),
  create: (data: Partial<Airport>): Promise<Airport> => unwrap(getApi().airports.post(data), airportSchema),
  update: (id: string, data: Partial<Airport>): Promise<Airport> => unwrap(getApi().airports({ id }).put(data), airportSchema),
  delete: (id: string): Promise<void> => unwrap(getApi().airports({ id }).delete()),
  triggerUpdate: (id: string): Promise<void> => unwrap(getApi().airports({ id }).update.post()),
  triggerUpdateAll: (): Promise<void> => unwrap(getApi().airports.batch['update-all'].post())
}

export const subscriptionApi = {
  list: (): Promise<Subscription[]> => unwrap(getApi().subscriptions.get(), z.array(subscriptionSchema)),
  get: (id: string): Promise<Subscription> => unwrap(getApi().subscriptions({ id }).get(), subscriptionSchema),
  create: (data: Partial<Subscription> & { airportIds: string[] }): Promise<Subscription> => unwrap(getApi().subscriptions.post(data), subscriptionSchema),
  update: (id: string, data: Partial<Subscription> & { airportIds?: string[] }): Promise<Subscription> => unwrap(getApi().subscriptions({ id }).put(data), subscriptionSchema),
  delete: (id: string): Promise<void> => unwrap(getApi().subscriptions({ id }).delete()),
  regenerateToken: (id: string): Promise<Subscription> => unwrap(getApi().subscriptions({ id })['regenerate-token'].post(), subscriptionSchema),
  getUrl: (token: string, target: string = 'clash'): string => `/_api/sub/${token}?target=${target}`
}

export const pluginApi = {
  list: (): Promise<AirportPlugin[]> => unwrap(getApi().plugins.get(), z.array(airportPluginSchema)),
  get: (id: string): Promise<AirportPlugin> => unwrap(getApi().plugins({ id }).get(), airportPluginSchema),
  create: (data: Partial<AirportPlugin>): Promise<AirportPlugin> => unwrap(getApi().plugins.post(data), airportPluginSchema),
  update: (id: string, data: Partial<AirportPlugin>): Promise<AirportPlugin> => unwrap(getApi().plugins({ id }).put(data), airportPluginSchema),
  delete: (id: string): Promise<void> => unwrap(getApi().plugins({ id }).delete()),
  toggle: (id: string): Promise<AirportPlugin> => unwrap(getApi().plugins({ id }).toggle.post(), airportPluginSchema)
}

export const systemApi = {
  triggerUpdate: (): Promise<void> => unwrap(getApi().system['trigger-update'].post())
}
