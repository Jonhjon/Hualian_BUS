import { PrismaClient } from '@prisma/client'

// SQL Server connection strings are ;-separated, not URL-style ?key=value.
// We append connection pool tuning at runtime so we don't have to edit .env
// in every environment. Default 20 connections / 10s pool timeout, matched
// to the 100-VU stress test that was previously dropping 99% of requests.
function buildDatabaseUrl(): string | undefined {
  const raw = process.env.DATABASE_URL
  if (!raw) return undefined
  const limit = process.env.DATABASE_CONNECTION_LIMIT ?? '20'
  const poolTimeout = process.env.DATABASE_POOL_TIMEOUT ?? '10'
  const extras: string[] = []
  if (!/(?:^|;)\s*connection_limit\s*=/i.test(raw)) extras.push(`connection_limit=${limit}`)
  if (!/(?:^|;)\s*pool_timeout\s*=/i.test(raw)) extras.push(`pool_timeout=${poolTimeout}`)
  if (extras.length === 0) return raw
  return raw.endsWith(';') ? `${raw}${extras.join(';')}` : `${raw};${extras.join(';')}`
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: buildDatabaseUrl(),
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
