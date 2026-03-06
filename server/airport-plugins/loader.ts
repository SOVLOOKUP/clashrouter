// 插件初始化 - 注册所有可用插件
import { registerPlugin } from './index'
import { genericPlugin, mojiePlugin } from './airports'

export function initializePlugins() {
  // 通用订阅
  registerPlugin(genericPlugin)
  // 魔戒机场
  registerPlugin(mojiePlugin)
  // 农夫山泉机场
  // registerPlugin(NFSQPlugin)

  console.log('✅ All plugins initialized')
}
