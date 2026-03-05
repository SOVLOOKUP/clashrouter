// 插件初始化 - 注册所有可用插件
import { registerPlugin } from './index'
import { genericPlugin } from './generic'

export function initializePlugins() {
  // 注册通用插件
  registerPlugin(genericPlugin)

  // 在这里可以注册更多自定义插件
  // registerPlugin(customPlugin1)
  // registerPlugin(customPlugin2)

  console.log('✅ All plugins initialized')
}
