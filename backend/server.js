import "dotenv/config";
import { validateEnv, env } from "./src/config/env.js";

validateEnv();

const { connectDB } = await import("./src/config/db.js");
const { createApp } = await import("./src/app.js");
const { ensureBaseData } = await import("./src/seed/ensureBaseData.js");

await connectDB();

// Guarantees the admin/owner/renter demo logins and the base category tree
// exist on every boot — without ever touching real data — so you never have
// to remember to run `npm run seed` after a restart or a fresh database.
// Set AUTO_SEED=false in .env to turn this off (e.g. in production).
if (env.autoSeed) {
  await ensureBaseData();
}

const app = createApp();

const server = app.listen(env.port, () => {
  console.log(`[server] Rent It API running on http://localhost:${env.port} (${env.nodeEnv})`);
});

// Fail loudly instead of leaving the process silently half-broken.
process.on("unhandledRejection", (err) => {
  console.error("[fatal] Unhandled promise rejection:", err);
  server.close(() => process.exit(1));
});
