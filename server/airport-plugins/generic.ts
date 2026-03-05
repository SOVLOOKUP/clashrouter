import type { AirportPlugin, SubscribeUrlParams } from './index'

export const genericPlugin: AirportPlugin = {
  name: '直接订阅',
  id: 'generic',
  description: '支持的订阅链接',
  type: 'subUrl',

  async getSubscribeUrl({ subUrl }: SubscribeUrlParams): Promise<string> {
    return subUrl ?? ''
  }
}
