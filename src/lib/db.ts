import { PrismaClient } from '@prisma/client'

/**
 * Database client with automatic Turso (libSQL) support.
 *
 * - LOCAL DEV: no env vars needed → uses SQLite file (DATABASE_URL)
 * - PRODUCTION (Netlify etc.): set TURSO_DATABASE_URL + TURSO_AUTH_TOKEN
 *   → routes all queries through the Turso remote database
 *
 * Turso is required for production because serverless platforms
 * (Netlify/Vercel) have ephemeral filesystems — a local SQLite file
 * cannot persist admin edits or leads there.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  if (tursoUrl) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaLibSQL } = require('@prisma/adapter-libsql')
    const adapter = new PrismaLibSQL({ url: tursoUrl, authToken: tursoToken })
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? [] : undefined,
    })
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? [] : undefined,
  })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
