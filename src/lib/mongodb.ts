import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || '';
if (!uri) {
  // Do not throw at import time to keep build working; functions will throw if used.
  // eslint-disable-next-line no-console
  console.warn('MONGODB_URI is not set');
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (!global._mongoClientPromise) {
  clientPromise = new MongoClient(uri, {
    // Retryable writes and serverless-friendly defaults
  }).connect();
  global._mongoClientPromise = clientPromise;
} else {
  clientPromise = global._mongoClientPromise;
}

export async function getDb() {
  if (!process.env.MONGODB_URI) throw new Error('Missing MONGODB_URI');
  const client = await clientPromise;
  const dbName = process.env.MONGODB_DB || 'kicklab';
  return client.db(dbName);
}

