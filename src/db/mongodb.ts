import { MongoClient, Db } from "mongodb";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

let client: MongoClient | null = null;
let db: Db | null = null;
let connectionPromise: Promise<boolean> | null = null;
let isFailedAttempt = false;

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
const MONGO_DB = process.env.MONGODB_DB;

/**
 * Connects to MongoDB Cloud Database.
 * If MONGODB_URI is not provided or connection fails, it falls back to local file storage.
 */
export async function connectDB(): Promise<boolean> {
  if (db) {
    return true;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  if (isFailedAttempt) {
    return false;
  }

  if (MONGO_URI) {
    connectionPromise = (async () => {
      try {
        console.log("Attempting to connect to MongoDB Cloud Database...");
        // Initialize MongoClient with fail-fast settings to prevent long-running background socket retries
        client = new MongoClient(MONGO_URI, {
          serverSelectionTimeoutMS: 4000,
          connectTimeoutMS: 4000,
        });
        await client.connect();
        db = client.db(MONGO_DB || undefined); // Uses database name from env override or fallback to connection string/default
        console.log("====================================================");
        console.log("🚀 CONNECTED TO MONGODB CLOUD DATABASE SUCCESSFULLY!");
        console.log("====================================================");
        return true;
      } catch (error) {
        console.error("❌ Failed to connect to MongoDB Cloud Database.", error);
        isFailedAttempt = true;
        if (client) {
          try {
            await client.close();
          } catch (closeError) {
            console.error("Error closing client after connection failure:", closeError);
          }
        }
        client = null;
        db = null;
        console.log("Falling back to local file database storage.");
        return false;
      } finally {
        connectionPromise = null;
      }
    })();

    return connectionPromise;
  }
  console.log("ℹ️ MONGODB_URI not found. Using local JSON files database.");
  return false;
}

// In-memory cache to guarantee that even under read-only filesystems or database downtime,
// the application maintains consistent state for the current session.
const inMemoryDb: Record<string, any[]> = {};

function getLocalDBPaths(collectionName: string) {
  // We check multiple locations:
  // 1. Current working directory data/mongodb_${name}.json (ideal for local/persistent dev)
  // 2. /tmp/mongodb_${name}.json (ideal for Vercel/serverless environments where cwd is read-only)
  const paths = [
    path.join(process.cwd(), "data", `mongodb_${collectionName}.json`),
    path.join("/tmp", `mongodb_${collectionName}.json`)
  ];
  return paths;
}

function readLocalData(collectionName: string, fallback: any = []): any[] {
  // If we already have it in memory, return it to keep session consistency
  if (inMemoryDb[collectionName]) {
    return inMemoryDb[collectionName];
  }

  const paths = getLocalDBPaths(collectionName);
  for (const p of paths) {
    try {
      if (fs.existsSync(p)) {
        const data = fs.readFileSync(p, "utf-8");
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          inMemoryDb[collectionName] = parsed;
          return parsed;
        }
      }
    } catch (e) {
      // Keep going to next path
    }
  }

  // If we couldn't find any of the dynamic paths, let's look for original mock files inside /data/
  const originalFiles = [
    path.join(process.cwd(), "data", `${collectionName}.json`),
    path.join(process.cwd(), "data", `mongodb_${collectionName}.json`),
  ];
  for (const originalPath of originalFiles) {
    try {
      if (fs.existsSync(originalPath)) {
        const data = fs.readFileSync(originalPath, "utf-8");
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          // Attempt to write it to a writable fallback path so we have it there next time
          writeLocalData(collectionName, parsed);
          return parsed;
        }
      }
    } catch (e) {}
  }

  // Use absolute fallback
  inMemoryDb[collectionName] = fallback;
  return fallback;
}

function writeLocalData(collectionName: string, data: any[]) {
  // Update in-memory cache first to guarantee session sync immediately
  inMemoryDb[collectionName] = data;

  const paths = getLocalDBPaths(collectionName);
  // Try writing to each path in sequence.
  // Usually, on a regular server/local, writing to process.cwd() works.
  // On Vercel, writing to process.cwd() fails (EROFS), but writing to /tmp/ succeeds.
  for (const p of paths) {
    try {
      const dir = path.dirname(p);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(p, JSON.stringify(data, null, 2), "utf-8");
      // If we successfully wrote to a file, we can break or continue.
      // Let's break so we don't spam multiple directories if the first one succeeded.
      return;
    } catch (e: any) {
      console.warn(`⚠️ Could not write local collection fallback to path ${p}:`, e.message || e);
    }
  }
}

/**
 * Safely reads a collection from either the Cloud Database or the local JSON fallback.
 */
export async function readCollection(collectionName: string, fallback: any = []): Promise<any[]> {
  if (db) {
    try {
      const collection = db.collection(collectionName);
      const data = await collection.find({}).toArray();

      // If the cloud collection is empty, automatically seed it using local JSON files
      if (data.length === 0) {
        const initialData = readLocalData(collectionName, fallback);
        if (initialData && initialData.length > 0) {
          console.log(`🌱 Seeding empty MongoDB Cloud collection '${collectionName}' with initial data...`);
          try {
            await collection.insertMany(initialData);
          } catch (seedErr) {
            console.error("Failed to seed database, returning initialData:", seedErr);
          }
          return initialData;
        }
      }

      // Strip MongoDB's internal _id object so frontend models stay clean
      const cleaned = data.map((doc) => {
        const { _id, ...cleanDoc } = doc;
        return cleanDoc;
      });

      // Keep memory cache updated with latest DB state
      inMemoryDb[collectionName] = cleaned;
      return cleaned;
    } catch (e) {
      console.error(`❌ MongoDB read error in collection ${collectionName}, using local fallback:`, e);
    }
  }

  // Local JSON File Fallback implementation
  return readLocalData(collectionName, fallback);
}

/**
 * Safely writes/replaces a collection in either the Cloud Database or the local JSON fallback.
 */
export async function writeCollection(collectionName: string, data: any[]) {
  if (db) {
    try {
      const collection = db.collection(collectionName);
      
      // Perform an atomic operation or simple clear-and-insert for syncing collections
      await collection.deleteMany({});
      if (data.length > 0) {
        await collection.insertMany(data);
      }
      
      // Update local memory cache as well
      inMemoryDb[collectionName] = data;
      return;
    } catch (e) {
      console.error(`❌ MongoDB write error in collection ${collectionName}, using local fallback:`, e);
    }
  }

  // Local JSON File Fallback implementation
  writeLocalData(collectionName, data);
}
