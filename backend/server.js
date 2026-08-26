import "dotenv/config";
import { validateEnv, env } from "./src/config/env.js";

validateEnv();

const { connectDB } = await import("./src/config/db.js");
const { createApp } = await import("./src/app.js");

await connectDB();
const app = createApp();

const server = app.listen(env.port, () => {
  console.log(`[server] Rent It API running on http://localhost:${env.port} (${env.nodeEnv})`);
});

// Fail loudly instead of leaving the process silently half-broken.
process.on("unhandledRejection", (err) => {
  console.error("[fatal] Unhandled promise rejection:", err);
  server.close(() => process.exit(1));
});
