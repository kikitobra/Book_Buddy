import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const uri = process.env.MONGODB_URI!;
const dbName = process.env.DB_NAME || "booksheet";
const collectionName = "orders";

async function initOrders() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db(dbName);

    // Check if collection exists
    const collections = await db
      .listCollections({ name: collectionName })
      .toArray();

    if (collections.length > 0) {
      console.log("⚠️  Orders collection already exists");
      return;
    }

    // Create collection with flexible validator
    await db.createCollection(collectionName, {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: [
            "orderId",
            "userId",
            "items",
            "shippingAddress",
            "total",
            "paymentMethod",
            "status",
            "createdAt",
          ],
          properties: {
            orderId: {
              bsonType: "string",
              description: "Unique order ID (format: BB-YYYYMMDD-XXXX)",
            },
            userId: {
              bsonType: "string",
              description: "User ID who placed the order",
            },
            items: {
              bsonType: "array",
              description: "Array of order items",
              minItems: 1,
              items: {
                bsonType: "object",
                required: ["bookId", "title", "quantity", "price"],
                properties: {
                  bookId: {
                    bsonType: "string",
                    description: "Book ISBN/ID",
                  },
                  title: {
                    bsonType: "string",
                    description: "Book title",
                  },
                  quantity: {
                    bsonType: ["int", "long", "double"],
                    minimum: 1,
                    description: "Quantity ordered",
                  },
                  price: {
                    bsonType: ["int", "long", "double"],
                    minimum: 0,
                    description: "Price per item",
                  },
                  cover: {
                    bsonType: ["string", "null"],
                    description: "Book cover image URL (optional)",
                  },
                },
              },
            },
            shippingAddress: {
              bsonType: "object",
              required: ["fullName", "phone", "street", "city", "country"],
              properties: {
                fullName: {
                  bsonType: "string",
                  description: "Full name of recipient",
                },
                phone: {
                  bsonType: "string",
                  description: "Phone number",
                },
                street: {
                  bsonType: "string",
                  description: "Street address",
                },
                city: {
                  bsonType: "string",
                  description: "City",
                },
                state: {
                  bsonType: ["string", "null"],
                  description: "State/Province (optional)",
                },
                postalCode: {
                  bsonType: ["string", "null"],
                  description: "Postal code (optional)",
                },
                country: {
                  bsonType: "string",
                  description: "Country",
                },
              },
            },
            total: {
              bsonType: ["int", "long", "double"],
              minimum: 0,
              description: "Total order amount",
            },
            paymentMethod: {
              enum: ["Cash on Delivery", "COD", "Credit Card", "PayPal"],
              description: "Payment method",
            },
            status: {
              enum: [
                "pending",
                "processing",
                "shipped",
                "delivered",
                "cancelled",
              ],
              description: "Order status",
            },
            createdAt: {
              bsonType: "date",
              description: "Order creation timestamp",
            },
            updatedAt: {
              bsonType: "date",
              description: "Last update timestamp",
            },
          },
        },
      },
      validationLevel: "moderate",
      validationAction: "error",
    });

    console.log("✅ Created collection with flexible validator");

    // Create indexes
    await db.collection(collectionName).createIndex({ userId: 1 });
    console.log("✅ Created index on userId");

    await db
      .collection(collectionName)
      .createIndex({ orderId: 1 }, { unique: true });
    console.log("✅ Created unique index on orderId");

    await db.collection(collectionName).createIndex({ createdAt: -1 });
    console.log("✅ Created index on createdAt");

    await db
      .collection(collectionName)
      .createIndex({ userId: 1, createdAt: -1 });
    console.log("✅ Created compound index on userId and createdAt");

    console.log("🎉 Orders collection initialization complete!");
  } catch (error) {
    console.error("❌ Error initializing orders collection:", error);
    throw error;
  } finally {
    await client.close();
  }
}

initOrders();
