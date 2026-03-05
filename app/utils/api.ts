import type {
  Airport,
  Subscription,
  AirportPlugin
} from '~/types/api'

function getApi() {
  const { $api } = useNuxtApp()

  if (!$api) {
    throw new Error('Eden API 客户端未注入')
  }

  return $api
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

async function unwrap<T>(request: Promise<unknown>): Promise<T> {
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

  return response as T
}

export const airportApi = {
  list: (): Promise<Airport[]> => unwrap(getApi().airports.get()),
  get: (id: string): Promise<Airport> => unwrap(getApi().airports({ id }).get()),
  create: (data: Partial<Airport>): Promise<Airport> => unwrap(getApi().airports.post(data)),
  update: (id: string, data: Partial<Airport>): Promise<Airport> => unwrap(getApi().airports({ id }).put(data)),
  delete: (id: string): Promise<void> => unwrap(getApi().airports({ id }).delete()),
  triggerUpdate: (id: string): Promise<void> => unwrap(getApi().airports({ id }).update.post()),
  triggerUpdateAll: (): Promise<void> => unwrap(getApi().airports.batch['update-all'].post())
}

export const subscriptionApi = {
  list: (): Promise<Subscription[]> => unwrap(getApi().subscriptions.get()),
  get: (id: string): Promise<Subscription> => unwrap(getApi().subscriptions({ id }).get()),
  create: (data: Partial<Subscription> & { airportIds: string[] }): Promise<Subscription> => unwrap(getApi().subscriptions.post(data)),
  update: (id: string, data: Partial<Subscription> & { airportIds?: string[] }): Promise<Subscription> => unwrap(getApi().subscriptions({ id }).put(data)),
  delete: (id: string): Promise<void> => unwrap(getApi().subscriptions({ id }).delete()),
  regenerateToken: (id: string): Promise<Subscription> => unwrap(getApi().subscriptions({ id })['regenerate-token'].post()),
  getUrl: (token: string, target: string = 'clash'): string => `/_api/sub/${token}?target=${target}`
}

export const pluginApi = {
  list: (): Promise<AirportPlugin[]> => unwrap(getApi().plugins.get()),
  get: (id: string): Promise<AirportPlugin> => unwrap(getApi().plugins({ id }).get()),
  create: (data: Partial<AirportPlugin>): Promise<AirportPlugin> => unwrap(getApi().plugins.post(data)),
  update: (id: string, data: Partial<AirportPlugin>): Promise<AirportPlugin> => unwrap(getApi().plugins({ id }).put(data)),
  delete: (id: string): Promise<void> => unwrap(getApi().plugins({ id }).delete()),
  toggle: (id: string): Promise<AirportPlugin> => unwrap(getApi().plugins({ id }).toggle.post())
}

export const systemApi = {
  triggerUpdate: (): Promise<void> => unwrap(getApi().system['trigger-update'].post())
}
