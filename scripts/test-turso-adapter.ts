/**
 * Deploy-readiness test: verifies the Turso/libSQL adapter code path in
 * src/lib/db.ts works before touching production. Uses a local file via
 * libsql `file:` URL — same code path as remote libsql:// (minus network).
 *
 * Test 1: TURSO_DATABASE_URL=file:...  → adapter used, query works
 * Test 2: no DATABASE_URL at all       → does PrismaClient constructor need it?
 */
import { config } from 'dotenv'

// Simulate Netlify: clear env, then set only what Netlify would have
delete process.env.DATABASE_URL
process.env.TURSO_DATABASE_URL = 'file:/home/z/my-project/db/custom.db'
delete process.env.TURSO_AUTH_TOKEN
config({ path: '.env', quiet: true }) // NO — we must NOT reload DATABASE_URL
delete process.env.DATABASE_URL

async function main() {
  console.log('DATABASE_URL present?', !!process.env.DATABASE_URL)
  console.log('TURSO_DATABASE_URL =', process.env.TURSO_DATABASE_URL)

  const { db } = await import('../src/lib/db')

  const categories = await db.category.count()
  const products = await db.product.count()
  const settings = await db.siteSetting.count()
  const schemas = await db.pageSchema.count()
  const leads = await db.inquiry.count()

  console.log('✅ ADAPTER PATH WORKS')
  console.log('   categories:', categories)
  console.log('   products:', products)
  console.log('   siteSettings:', settings)
  console.log('   pageSchemas:', schemas)
  console.log('   inquiries:', leads)

  // write test (adapter must support writes too — admin panel + leads)
  const test = await db.siteSetting.upsert({
    where: { key: 'deployAdapterTest' },
    update: { value: new Date().toISOString() },
    create: { key: 'deployAdapterTest', value: new Date().toISOString() },
  })
  console.log('✅ WRITE VIA ADAPTER WORKS:', test.value)
  await db.siteSetting.delete({ where: { key: 'deployAdapterTest' } })
  console.log('✅ DELETE WORKS — cleanup done')

  await (db as unknown as { $disconnect: () => Promise<void> }).$disconnect()
}

main().catch((e) => {
  console.error('❌ ADAPTER TEST FAILED:', e)
  process.exit(1)
})
