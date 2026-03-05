// API 类型定义
export interface Airport {
  id: string
  name: string
  pluginType: string
  username?: string
  password?: string
  subUrl?: string
  updateFrequency: number
  lastUpdateTime?: string
  status: string
  errorMessage?: string
  nodesJson?: string[]
  nodeCount?: number
  createdAt: string
  updatedAt: string
}

export interface AirportPlugin {
  id: string
  name: string
  type: 'subUrl' | 'credentials' | 'either'
  description?: string
  enabled: boolean
}

export interface Node {
  id: string
  name: string
  type: string
  server: string
  port: number
  password?: string
  uuid?: string
  alterId?: number
  cipher?: string
  network?: string
  tls: boolean
  sni?: string
  host?: string
  path?: string
  latency?: number
  bandwidth?: number
  status: string
  rawConfig: string
  airportId: string
  createdAt: string
  updatedAt: string
  airport?: {
    id: string
    name: string
  }
}

export interface Subscription {
  id: string
  name: string
  token: string
  description?: string
  config?: string
  createdAt: string
  updatedAt: string
  airports?: Airport[]
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
