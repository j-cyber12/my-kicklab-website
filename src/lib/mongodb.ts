import { MongoClient } from 'mongodb';

let clientPromise: Promise<MongoClient> | null = null;

function ensureValidUri(uri: string | undefined) {
  if (!uri) throw new Error('Missing MONGODB_URI');
  if (!/^mongodb(\+srv)?:\/\//.test(uri)) {
    throw new Error('MONGODB_URI must start with "mongodb://" or "mongodb+srv://"');
  }
}

export async function getDb() {
  const uri = process.env.MONGODB_URI;
  ensureValidUri(uri);
  if (!clientPromise) {
    clientPromise = new MongoClient(uri as string, {}).connect();
  }
  const client = await clientPromise;
  const dbName = process.env.MONGODB_DB || 'kicklab';
  return client.db(dbName);
}
