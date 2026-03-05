function getApi(): any {
  const { $api } = useNuxtApp()

  if (!$api) {
    throw new Error('Eden API 客户端未注入')
  }

  return $api
}

function normalizeError(error: any) {
  if (!error) return '请求失败'
  if (typeof error === 'string') return error
  if (error.value?.message) return error.value.message
  if (error.message) return error.message
  return '请求失败'
}

async function unwrap(request: Promise<any>): Promise<any> {
  let response
  try {
    response = await request
  } catch (error: any) {
    throw new Error(normalizeError(error))
  }

  // 处理 Eden API 格式: { data, error }
  if ('error' in response && response.error) {
    throw new Error(normalizeError(response.error))
  }

  if ('data' in response && 'error' in response) {
    // 这是 Eden API 格式，需要提取 data 并继续处理
    response = response.data
  }

  // 处理自定义格式: { success, data/message, error }
  if ('success' in response) {
    if (!response.success) {
      throw new Error(response.error || response.message || '请求失败')
    }
    // 优先返回 data
    return response.data !== undefined ? response.data : response
  }

  // 直接返回响应
  return response
}

export const airportApi = {
  list: () => unwrap(getApi().airports.get()),
  get: (id: string) => unwrap(getApi().airports({ id }).get()),
  create: (data: any) => unwrap(getApi().airports.post(data)),
  update: (id: string, data: any) => unwrap(getApi().airports({ id }).put(data)),
  delete: (id: string) => unwrap(getApi().airports({ id }).delete()),
  triggerUpdate: (id: string) => unwrap(getApi().airports({ id }).update.post()),
  triggerUpdateAll: () => unwrap(getApi().airports.batch['update-all'].post())
}

export const nodeApi = {
  list: (params?: any) => {
    const queryParams: Record<string, string | number> = {}

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          queryParams[key] = value as string | number
        }
      })
    }

    return unwrap(getApi().nodes.get({ query: queryParams }))
  },
  get: (id: string) => unwrap(getApi().nodes({ id }).get()),
  delete: (id: string) => unwrap(getApi().nodes({ id }).delete()),
  batchDelete: (nodeIds: string[]) => unwrap(getApi().nodes['batch-delete'].post({ nodeIds }))
}

export const subscriptionApi = {
  list: () => unwrap(getApi().subscriptions.get()),
  get: (id: string) => unwrap(getApi().subscriptions({ id }).get()),
  create: (data: any) => unwrap(getApi().subscriptions.post(data)),
  update: (id: string, data: any) => unwrap(getApi().subscriptions({ id }).put(data)),
  delete: (id: string) => unwrap(getApi().subscriptions({ id }).delete()),
  regenerateToken: (id: string) => unwrap(getApi().subscriptions({ id })['regenerate-token'].post()),
  getUrl: (token: string, target: string = 'clash') => `/_api/sub/${token}?target=${target}`
}

export const pluginApi = {
  list: () => unwrap(getApi().plugins.get()),
  get: (id: string) => unwrap(getApi().plugins({ id }).get()),
  create: (data: any) => unwrap(getApi().plugins.post(data)),
  update: (id: string, data: any) => unwrap(getApi().plugins({ id }).put(data)),
  delete: (id: string) => unwrap(getApi().plugins({ id }).delete()),
  toggle: (id: string) => unwrap(getApi().plugins({ id }).toggle.post())
}

export const systemApi = {
  triggerUpdate: () => unwrap(getApi().system['trigger-update'].post())
}
