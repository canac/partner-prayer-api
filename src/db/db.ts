import { MongoClient, Db } from 'mongodb';

let db: Db | null = null;

const {
  DB_PROTOCOL: protocol,
  DB_HOST: host,
  DB_USER: user,
  DB_PASS: password,
} = process.env;

export async function getDb(): Promise<Db> {
  if (db) {
    return db;
  }

  const auth = user || password ? `${user}:${password}@` : '';
  const uri = `${protocol}://${auth}${host}/partnerPrayer?retryWrites=true&w=majority`;
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  return client.db('partnerPrayer');
};
