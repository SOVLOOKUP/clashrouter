import ky from 'ky'
import type { AirportPlugin, SubscribeUrlParams } from './index'

export const genericPlugin: AirportPlugin = {
  name: '直接订阅',
  id: 'generic',
  description: '支持的订阅链接',
  type: 'subUrl',

  async getSubscribeContent({ subUrl }: SubscribeUrlParams): Promise<string> {
    return subUrl ?? ''
  }
}

const defaultHost = 'https://mojie.复雅.com'
export const xboardPlugin: AirportPlugin = {
  name: 'Xboard',
  id: 'xboard',
  description: '采用 Xboard 技术搭建的机场，输入账号密码获取订阅链接',
  type: 'credentials',

  async getSubscribeContent({ username, password, host }: SubscribeUrlParams): Promise<string> {
    const baseUrl = (host?.trim() || defaultHost).replace(/\/$/, '')

    // 解析 Xboard token
    const dataurl = `${baseUrl}/api/?action=login&email=${username}&password=${password}`
    const { data: auth } = await ky.get(dataurl).json<{ data: string }>()
    const tipsurl = `${baseUrl}/api?action=gettipsbody`
    const res = await ky
      .get(tipsurl, {
        headers: {
          cookie: `auth=${auth}`
        }
      })
      .text()

    // 提取 ?token= 后面的 " 前面的内容
    const token = res.match(/\?token=(.*?)"/)?.[1]

    if (!token) {
      throw new Error('无法获取 Xboard 订阅链接，请检查用户名和密码是否正确')
    }

    const xboardSubUrl = `${baseUrl}/api/v1/client/subscribe?token=${token}`

    return xboardSubUrl
  }
}

// const nfsqBase = 'http://8.138.163.124:90'
// export const NFSQPlugin: AirportPlugin = {
//   name: '农夫山泉',
//   id: 'nfsq',
//   description: 'www.nfsqttt.com',
//   type: 'credentials',

//   async getSubscribeContent({ username, password }: SubscribeUrlParams): Promise<string> {
//     let token
//     try {
//       token = (await ky.post(`${nfsqBase}/api/v1/passport/auth/login`, {
//         headers: {
//           'user-agent': 'Mozilla/5.0 (dart:io) SuperAccelerator'
//         },
//         body: new URLSearchParams({
//           email: username!,
//           password: password!
//         })
//       }).json<{ data: { auth_data: string, token: string } }>()).data.token
//     } catch {
//       throw new Error('无法获取农夫山泉订阅链接，请检查用户名和密码是否正确')
//     }

//     const content = await ky.get(`${nfsqBase}/nongfuttt/`, {
//       headers: {
//         'user-agent': 'Nongfu/v2.2.1 clash-verge Platform/windows'
//       },
//       searchParams: {
//         token
//       }
//     }).text()

//     // todo 需要解密
//     return content
//   }
// }
