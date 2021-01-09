import { MongoClient } from 'https://deno.land/x/mongo@v0.20.1/mod.ts';
import { Database } from 'https://deno.land/x/mongo@v0.20.1/src/database.ts';

let db: Database | null = null;

const {
  DB_HOST: host,
  DB_USER: user,
  DB_PASS: password,
} = Deno.env.toObject();

export async function getDb(): Promise<Database> {
  if (db) {
    return db;
  }

  const dbName = 'partnerPrayer';
  const client: MongoClient = new MongoClient();
  await client.connect({
    servers: [{
      host,
      port: 27017,
    }],
    dbName,
    auth: { user, password },
    retryWrites: 'true',
    w: 'majority',
  });
  db = client.database(dbName);
  return db;
};
