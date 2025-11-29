// scripts/migrate.js
"use strict";

const fs = require("fs").promises;
const path = require("path");
const { MongoClient } = require("mongodb");

const MONGO_URI = process.env.MONGO_URI || "your-mongodb-atlas-uri";
const DB_NAME = process.env.MONGO_DB || "real_estate";
const DATA_DIR = path.join(__dirname, "../data");

// Map JSON files → MongoDB collections
const COLLECTIONS = {
  admin: "admin.json",
  archives: "archives.json",
  bookings: "bookings.json",
  clients: "clients.json",
  commissions: "commissions.json",
  landlords: "landlords.json",
  listings: "listings.json",
  otp: "otp.json",
  payments: "payments.json",
  sales: "sales.json",
  testimonials: "testimonials.json"
};

// Reuse a single MongoDB client connection
const client = new MongoClient(MONGO_URI, {
  // tune for high parallelism
  maxPoolSize: 50,
  minPoolSize: 5,
  serverSelectionTimeoutMS: 10000
});

let isRunning = false; // prevent overlapping runs

async function readJSON(filePath) {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    // If file missing or invalid, return empty array
    return [];
  }
}

async function ensureUniqueIndexes(db) {
  // Create unique indexes on id for all collections, in parallel.
  await Promise.all(
    Object.keys(COLLECTIONS).map(async (collectionName) => {
      const col = db.collection(collectionName);
      // Idempotent: will succeed if index already exists
      await col.createIndex({ id: 1 }, { unique: true, name: "unique_id" });
    })
  );
}

function toBulkOps(records) {
  // Use bulk upsert for high throughput and deduplication by id
  return records.map((r) => ({
    updateOne: {
      filter: { id: r.id },
      update: { $set: r },
      upsert: true
    }
  }));
}

async function migrateOnce() {
  if (isRunning) {
    console.log(`[${new Date().toISOString()}] Skip: previous migration still running.`);
    return;
  }
  isRunning = true;

  try {
    if (!client.topology?.isConnected()) {
      await client.connect();
    }
    const db = client.db(DB_NAME);

    // Ensure unique indexes (dedupe guarantee) before writes
    await ensureUniqueIndexes(db);

    console.log(`[${new Date().toISOString()}] Migration started.`);

    // Read all JSON files in parallel
    const entries = await Promise.all(
      Object.entries(COLLECTIONS).map(async ([collectionName, fileName]) => {
        const filePath = path.join(DATA_DIR, fileName);
        const records = await readJSON(filePath);
        return { collectionName, records };
      })
    );

    // Perform bulk upserts in parallel for all collections
    const results = await Promise.all(
      entries.map(async ({ collectionName, records }) => {
        const col = db.collection(collectionName);

        if (!Array.isArray(records) || records.length === 0) {
          return { collectionName, matched: 0, upserted: 0, modified: 0, total: 0 };
        }

        const bulkOps = toBulkOps(records);
        const res = await col.bulkWrite(bulkOps, { ordered: false });

        const matched = res.matchedCount || 0;
        const modified = res.modifiedCount || 0;
        const upserted = (res.upsertedCount || 0);

        console.log(
          `→ ${collectionName}: total=${records.length}, matched=${matched}, modified=${modified}, upserted=${upserted}`
        );

        return { collectionName, matched, modified, upserted, total: records.length };
      })
    );

    console.log(`[${new Date().toISOString()}] Migration completed.`);

    // Optional: print a compact summary line
    const summary = results
      .map(r => `${r.collectionName}[total:${r.total},upserted:${r.upserted},modified:${r.modified}]`)
      .join(" | ");
    console.log(`Summary: ${summary}`);
  } catch (err) {
    console.error("Migration error:", err?.message || err);
  } finally {
    isRunning = false;
    // Keep the connection open for the next run (better performance)
  }
}

// Schedule: run every 5 minutes, avoid overlap
function schedule() {
  // Run immediately once
  migrateOnce().finally(() => {
    // Then every 5 minutes
    setInterval(migrateOnce, 5 * 60 * 1000);
  });
}

// Start scheduler
schedule();
