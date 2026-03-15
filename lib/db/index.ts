import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Neon is HTTP-based — it only opens a connection when a query is executed,
// not at module load time. The placeholder URL lets the module import succeed
// during `next build` when DATABASE_URL is absent; any real query will throw
// at runtime if the env var is still missing.
const sql = neon(process.env.DATABASE_URL ?? 'postgresql://build:build@build.neon.tech/build');

export const db = drizzle(sql, { schema });

export type DB = typeof db;
