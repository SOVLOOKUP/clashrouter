import { PrismaClient } from '../generated/prisma/client'
import { PrismaBunSqlite } from 'prisma-adapter-bun-sqlite'
import { resolve } from 'node:path'

const prismaClientSingleton = () => {
  const defaultDbUrl = 'file:./data/clashrouter.db'
  const rawDbUrl = process.env.DATABASE_URL || defaultDbUrl

  let dbUrl = rawDbUrl
  if (rawDbUrl.startsWith('file:')) {
    const filePath = rawDbUrl.slice('file:'.length)
    const isAbsolute = filePath.startsWith('/')

    if (!isAbsolute) {
      // 固定解析到项目根目录，避免在不同运行目录下连接到错误的 SQLite 文件
      const projectRoot = process.cwd()
      const absolutePath = resolve(projectRoot, filePath)
      dbUrl = `file:${absolutePath}`
    }
  }

  const adapter = new PrismaBunSqlite({ url: dbUrl })
  return new PrismaClient({ adapter })
}

const prisma = prismaClientSingleton()

export default prisma
