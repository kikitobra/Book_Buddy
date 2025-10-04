// scripts/initWishlist.ts
import { config } from "dotenv";
import { getDb } from "../src/lib/mongodb";

// Load real secrets first; fall back to example if needed
config({ path: ".env.local" });
if (!process.env.MONGODB_URI) {
  config({ path: ".env.local.example" });
}

async function initWishlistCollection() {
  try {
    const db = await getDb();
    const collectionName = "wishlist";

    // Check if collection already exists
    const collections = await db
      .listCollections({ name: collectionName })
      .toArray();

    if (collections.length > 0) {
      console.log(`✅ Collection '${collectionName}' already exists`);
    } else {
      // Create wishlist collection
      await db.createCollection(collectionName, {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["userId", "bookId", "addedAt"],
            properties: {
              userId: { bsonType: "objectId" },
              bookId: { bsonType: "objectId" },
              addedAt: { bsonType: "date" },
            },
          },
        },
      });
      console.log(`✅ Created collection '${collectionName}' with validator`);
    }

    // Create indexes for better performance
    const wishlistCollection = db.collection(collectionName);

    // Compound index on userId and bookId (unique to prevent duplicates)
    await wishlistCollection.createIndex(
      { userId: 1, bookId: 1 },
      { unique: true, name: "unique_user_book" }
    );
    console.log("✅ Created unique compound index on userId and bookId");

    // Index on userId for quick user wishlist queries
    await wishlistCollection.createIndex(
      { userId: 1 },
      { name: "user_wishlist" }
    );
    console.log("✅ Created index on userId");

    // Index on addedAt for sorting
    await wishlistCollection.createIndex(
      { addedAt: -1 },
      { name: "wishlist_date" }
    );
    console.log("✅ Created index on addedAt");

    console.log("🎉 Wishlist collection initialized successfully!");
  } catch (error) {
    console.error("❌ Error initializing wishlist collection:", error);
    process.exit(1);
  }
}

initWishlistCollection()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
