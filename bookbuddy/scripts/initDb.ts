// scripts/initDb.ts
import { config } from "dotenv";

// Load real secrets first; fall back to example if needed
config({ path: ".env.local" });
if (!process.env.MONGODB_URI) {
  config({ path: ".env.local.example" });
}

import { getDb } from "../src/lib/mongodb";

async function run() {
  const db = await getDb();
  const collectionName = process.env.COLLECTION_NAME || "book_inventory";
  const colExists =
    (await db.listCollections({ name: collectionName }).toArray()).length > 0;

  // 0) Drop old collection (as requested)
  if (colExists) {
    await db.collection(collectionName).drop();
    console.log(`🗑️ Dropped collection ${collectionName}`);
  } else {
    console.log(`ℹ️ Collection ${collectionName} did not exist`);
  }

  // 1) Recreate with validator
  await db.createCollection(collectionName, {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: [
          "title",
          "isbn",
          "author",
          "cover_url",
          "summary",
          "language",
          "quantity",
        ],
        properties: {
          title: { bsonType: "string" },
          isbn: { bsonType: "string" },
          author: { bsonType: "string" },
          summary: { bsonType: "string" },
          cover_url: { bsonType: "string" },
          language: { bsonType: "string" }, // app field, NOT used by text index anymore
          genre: { bsonType: "string" },
          quantity: { bsonType: "int", minimum: 0 },
          source: { bsonType: "string" },
          text_language: { bsonType: "string" }, // used by text index override
          createdAt: { bsonType: "date" },
          updatedAt: { bsonType: "date" },
        },
      },
    },
  });
  console.log(`✅ Created collection ${collectionName} with validator`);

  // 2) Indexes
  await db
    .collection(collectionName)
    .createIndex({ isbn: 1 }, { unique: true, sparse: true });

  // Text index uses language_override=text_language so our app's "language" can be 'en'
  await db.collection(collectionName).createIndex(
    { title: "text", author: "text" },
    {
      default_language: "english",
      language_override: "text_language",
      name: "title_author_text",
    }
  );

  await db.collection(collectionName).createIndex({ genre: 1 });
  console.log(
    "✅ Indexes ensured (text index uses language_override=text_language)"
  );
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
