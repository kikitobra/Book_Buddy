import { config } from "dotenv";
config({ path: ".env.local" });
if (!process.env.MONGODB_URI) config({ path: ".env.local.example" });
import { getDb } from "../src/lib/mongodb";

async function main() {
  const db = await getDb();
  const name = process.env.USERS_COLLECTION || "users";

  const exists = (await db.listCollections({ name }).toArray()).length > 0;
  if (!exists) {
    await db.createCollection(name, {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: [
            "email",
            "password_hash",
            "name",
            "role",
            "status",
            "email_verified",
            "failed_login_attempts",
            "created_at",
            "updated_at",
          ],
          properties: {
            email: { bsonType: "string" },
            password_hash: { bsonType: "string" },
            name: { bsonType: "string" },
            role: { enum: ["user", "admin"] },
            status: { enum: ["active", "disabled"] },
            email_verified: { bsonType: "bool" },
            failed_login_attempts: { bsonType: "int", minimum: 0 },
            created_at: { bsonType: "date" },
            updated_at: { bsonType: "date" },
          },
        },
      },
    });
    console.log(`✅ created ${name}`);
  } else {
    console.log(`ℹ️ ${name} exists`);
  }

  // ensure a single, case-insensitive unique index on email
  const users = db.collection(name);

  // Read current indexes
  const idxs = await users.indexes();

  // Desired spec
  const desiredName = "uniq_email_ci";
  const desiredKey = { email: 1 };
  const desiredUnique = true;
  const desiredCollation = { locale: "en", strength: 2 };

  // Does the desired index already exist exactly?
  const hasDesired = idxs.some(
    (ix) =>
      ix.name === desiredName &&
      ix.unique === desiredUnique &&
      ix.key &&
      (ix.key as any).email === 1 &&
      ix.collation?.locale === desiredCollation.locale &&
      ix.collation?.strength === desiredCollation.strength
  );

  // If not, drop any index that targets 'email' and recreate the canonical one
  if (!hasDesired) {
    for (const ix of idxs) {
      if (!ix.name) continue; // safety: TypeScript expects a string name
      if (ix.key && Object.prototype.hasOwnProperty.call(ix.key, "email")) {
        await users.dropIndex(ix.name).catch(() => {});
        console.log(`🗑️ dropped email index: ${ix.name}`);
      }
    }
    await users.createIndex(desiredKey, {
      unique: desiredUnique,
      collation: desiredCollation,
      name: desiredName,
    });
    console.log("✅ email unique index ensured (case-insensitive)");
  } else {
    console.log("ℹ️ email unique index already correct (case-insensitive)");
  }
}
main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
