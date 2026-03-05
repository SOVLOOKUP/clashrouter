// 插件主体函数：接收机场参数对象，动态返回订阅链接
export interface SubscribeUrlParams {
  username?: string
  password?: string
  subUrl?: string
}

export type PluginConfigMode = 'subUrl' | 'credentials' | 'either'

export type SubscribeUrlResolver = (params: SubscribeUrlParams) => Promise<string>

export interface AirportPlugin {
  name: string
  id: string
  description: string
  type: PluginConfigMode

  // 获取订阅链接
  getSubscribeUrl: SubscribeUrlResolver
}

// 插件注册表
const pluginRegistry = new Map<string, AirportPlugin>()

export function registerPlugin(plugin: AirportPlugin) {
  pluginRegistry.set(plugin.id, plugin)
  console.log(`✅ Registered plugin: ${plugin.name} (${plugin.id})`)
}

export function getPlugin(id: string): AirportPlugin | undefined {
  return pluginRegistry.get(id)
}

export function getAllPlugins(): AirportPlugin[] {
  return Array.from(pluginRegistry.values())
}

export function hasPlugin(id: string): boolean {
  return pluginRegistry.has(id)
}
