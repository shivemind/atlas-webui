/**
 * Prisma client pointing at the shared EchoAtlas Neon Postgres database.
 * Uses ECHOATLAS_DATABASE_URL so it doesn't conflict with the local payments SQLite DB.
 * Gracefully handles missing env var -- callers should check before using.
 */
let _prisma: import('../../node_modules/.prisma/echoatlas/index.js').PrismaClient | null = null;

function getClient() {
  if (!process.env.ECHOATLAS_DATABASE_URL) {
    throw new Error('ECHOATLAS_DATABASE_URL is not set');
  }
  if (!_prisma) {
    const { PrismaClient } = require('../../node_modules/.prisma/echoatlas/index.js');
    _prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  }
  return _prisma!;
}

export const prisma = new Proxy({} as import('../../node_modules/.prisma/echoatlas/index.js').PrismaClient, {
  get(_target, prop) {
    const client = getClient();
    const val = (client as unknown as Record<string | symbol, unknown>)[prop];
    return typeof val === 'function' ? val.bind(client) : val;
  },
});
