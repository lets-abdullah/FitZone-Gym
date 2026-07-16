import { MongoClient, Db } from "mongodb";
import fs from "fs";
import path from "path";

let client: MongoClient | null = null;
let db: Db | null = null;
let connectionPromise: Promise<boolean> | null = null;
let isFailedAttempt = false;

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
const MONGO_DB = process.env.MONGODB_DB;

/**
 * Connects to MongoDB Atlas.
 * If MONGO_URI is not set or connection fails, falls back to local JSON file storage.
 */
export async function connectDB(): Promise<boolean> {
  if (db) return true;
  if (connectionPromise) return connectionPromise;
  if (isFailedAttempt) return false;

  if (!MONGO_URI) {
    console.log("ℹ️  MONGO_URI not set. Using local JSON file database fallback.");
    return false;
  }

  connectionPromise = (async () => {
    try {
      console.log("Connecting to MongoDB Atlas...");
      client = new MongoClient(MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      });
      await client.connect();
      db = client.db(MONGO_DB || undefined);
      console.log("✅ Connected to MongoDB Atlas successfully!");
      return true;
    } catch (error) {
      console.error("❌ MongoDB Atlas connection failed:", error);
      isFailedAttempt = true;
      if (client) {
        try { await client.close(); } catch {}
      }
      client = null;
      db = null;
      console.log("⚠️  Falling back to local JSON file storage.");
      return false;
    } finally {
      connectionPromise = null;
    }
  })();

  return connectionPromise;
}

// ─── In-Memory Cache ──────────────────────────────────────────────────────────
const inMemoryDb: Record<string, any[]> = {};

function getLocalDBPaths(collectionName: string): string[] {
  return [
    path.join(process.cwd(), "data", `mongodb_${collectionName}.json`),
    path.join("/tmp", `mongodb_${collectionName}.json`),
  ];
}

function readLocalData(collectionName: string, fallback: any[] = []): any[] {
  if (inMemoryDb[collectionName]) return inMemoryDb[collectionName];

  const paths = getLocalDBPaths(collectionName);
  for (const p of paths) {
    try {
      if (fs.existsSync(p)) {
        const parsed = JSON.parse(fs.readFileSync(p, "utf-8"));
        if (Array.isArray(parsed)) {
          inMemoryDb[collectionName] = parsed;
          return parsed;
        }
      }
    } catch {}
  }

  // Try original seed files in /data/
  const seedFiles = [
    path.join(process.cwd(), "data", `${collectionName}.json`),
    path.join(process.cwd(), "data", `mongodb_${collectionName}.json`),
  ];
  for (const p of seedFiles) {
    try {
      if (fs.existsSync(p)) {
        const parsed = JSON.parse(fs.readFileSync(p, "utf-8"));
        if (Array.isArray(parsed)) {
          writeLocalData(collectionName, parsed);
          return parsed;
        }
      }
    } catch {}
  }

  inMemoryDb[collectionName] = fallback;
  return fallback;
}

function writeLocalData(collectionName: string, data: any[]) {
  inMemoryDb[collectionName] = data;
  const paths = getLocalDBPaths(collectionName);
  for (const p of paths) {
    try {
      const dir = path.dirname(p);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(p, JSON.stringify(data, null, 2), "utf-8");
      return;
    } catch (e: any) {
      console.warn(`⚠️  Could not write fallback to ${p}:`, e.message || e);
    }
  }
}

/**
 * Reads a collection from MongoDB or local JSON fallback.
 */
export async function readCollection(collectionName: string, fallback: any[] = []): Promise<any[]> {
  if (db) {
    try {
      const collection = db.collection(collectionName);
      const data = await collection.find({}).toArray();

      if (data.length === 0) {
        const initialData = readLocalData(collectionName, fallback);
        if (initialData.length > 0) {
          console.log(`🌱 Seeding '${collectionName}' collection with initial data...`);
          try { await collection.insertMany(initialData); } catch (err) {
            console.error("Seed failed, returning initialData:", err);
          }
          return initialData;
        }
      }

      const cleaned = data.map(({ _id, ...doc }) => doc);
      inMemoryDb[collectionName] = cleaned;
      return cleaned;
    } catch (e) {
      console.error(`❌ MongoDB read error [${collectionName}], using fallback:`, e);
    }
  }
  return readLocalData(collectionName, fallback);
}

/**
 * Writes/replaces a collection in MongoDB or local JSON fallback.
 */
export async function writeCollection(collectionName: string, data: any[]) {
  if (db) {
    try {
      const collection = db.collection(collectionName);
      await collection.deleteMany({});
      if (data.length > 0) await collection.insertMany(data);
      inMemoryDb[collectionName] = data;
      return;
    } catch (e) {
      console.error(`❌ MongoDB write error [${collectionName}], using fallback:`, e);
    }
  }
  writeLocalData(collectionName, data);
}
