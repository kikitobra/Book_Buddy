import { MongoClient, Db, Collection, Document } from "mongodb";

// ✅ Load envs for all Node contexts (Next API routes, scripts, etc.)
try {
  // Prefer real .env.local if present; otherwise use .env.local.example
  if (!process.env.MONGODB_URI) {
    // Try .env.local first (if you happen to create it later)
    require("dotenv").config({ path: ".env.local" });
  }
  if (!process.env.MONGODB_URI) {
    // Fall back to the template file as requested
    require("dotenv").config({ path: ".env.local.example" });
  }
} catch {
  /* ignore in edge runtimes */
}

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToDatabase(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set in environment");

  if (client) return client;
  client = new MongoClient(uri);
  await client.connect();
  return client;
}

export async function getDb(): Promise<Db> {
  if (db) return db;
  const c = await connectToDatabase();
  const name = process.env.DB_NAME || "booksheet";
  db = c.db(name);
  return db;
}

export async function getCollection<T extends Document = Document>(
  name?: string
): Promise<Collection<T>> {
  const database = await getDb();
  return database.collection<T>(
    name || process.env.COLLECTION_NAME || "book_inventory"
  );
}
