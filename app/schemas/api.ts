import { z } from 'zod'

export const airportSchema = z.object({
  id: z.string(),
  name: z.string(),
  pluginType: z.string(),
  username: z.string().optional(),
  password: z.string().optional(),
  subUrl: z.string().optional(),
  updateFrequency: z.number(),
  lastUpdateTime: z.string().optional(),
  status: z.string(),
  errorMessage: z.string().optional(),
  nodesJson: z.array(z.string()).optional(),
  nodeCount: z.number().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
})

export const airportPluginSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['subUrl', 'credentials', 'either']),
  description: z.string().optional(),
  enabled: z.boolean()
})

export const nodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  server: z.string(),
  port: z.number(),
  password: z.string().optional(),
  uuid: z.string().optional(),
  alterId: z.number().optional(),
  cipher: z.string().optional(),
  network: z.string().optional(),
  tls: z.boolean(),
  sni: z.string().optional(),
  host: z.string().optional(),
  path: z.string().optional(),
  latency: z.number().optional(),
  bandwidth: z.number().optional(),
  status: z.string(),
  rawConfig: z.string(),
  airportId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  airport: z.object({
    id: z.string(),
    name: z.string()
  }).optional()
})

export const subscriptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  token: z.string(),
  description: z.string().optional(),
  config: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  airports: z.array(airportSchema).optional()
})
