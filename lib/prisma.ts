import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'
import fs from 'fs'

const getDbPath = () => {
  const prismaPath = path.resolve(process.cwd(), 'prisma', 'dev.db')
  if (fs.existsSync(prismaPath) && fs.statSync(prismaPath).size > 0) {
    return prismaPath
  }
  return path.resolve(process.cwd(), 'dev.db')
}

const prismaClientSingleton = () => {
  const dbPath = getDbPath()
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
  return new PrismaClient({ adapter })
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

let prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

if (prisma && !('department' in (prisma as any))) {
  prisma = prismaClientSingleton()
  if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
}

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
