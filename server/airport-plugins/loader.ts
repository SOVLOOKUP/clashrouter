// 插件初始化 - 注册所有可用插件
import { registerPlugin } from './index'
import { genericPlugin, xboardPlugin } from './airports'

export function initializePlugins() {
  // 通用订阅
  registerPlugin(genericPlugin)
  // Xboard 机场
  registerPlugin(xboardPlugin)
  // 农夫山泉机场
  // registerPlugin(NFSQPlugin)

  console.log('✅ All plugins initialized')
}
