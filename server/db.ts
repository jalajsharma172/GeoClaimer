import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Construct DATABASE_URL from individual PG environment variables if available
let databaseUrl = process.env.DATABASE_URL;

if (process.env.PGHOST && process.env.PGUSER && process.env.PGPASSWORD && process.env.PGDATABASE && process.env.PGPORT) {
  databaseUrl = `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}?sslmode=require`;
  console.log("Using constructed DATABASE_URL from PG environment variables with SSL");
}

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL must be set or PG* environment variables must be available. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ 
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }
});
export const db = drizzle(pool, { schema });