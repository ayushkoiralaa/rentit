// CLI entry point for `npm run seed` — safe to run anytime, as many times
// as you like. It only fills in missing demo accounts/categories and never
// deletes anything. For the old destructive "wipe everything and rebuild
// rich demo data" behavior, use `npm run seed:reset` instead.
import "dotenv/config";
import mongoose from "mongoose";
import { validateEnv } from "../config/env.js";
import { connectDB } from "../config/db.js";
import { ensureBaseData } from "./ensureBaseData.js";

validateEnv();
await connectDB();
const { createdAccounts } = await ensureBaseData();

if (createdAccounts.length === 0) {
  console.log("[seed] Everything already in place — nothing to create.");
}
console.log("[seed] Done.");

await mongoose.connection.close();
process.exit(0);
