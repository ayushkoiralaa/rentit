import "dotenv/config";
import { validateEnv, env } from "./src/config/env.js";

validateEnv();

const { connectDB } = await import("./src/config/db.js");
const { createApp } = await import("./src/app.js");
const { ensureBaseData } = await import("./src/seed/ensureBaseData.js");

await connectDB();

if (env.autoSeed) {
  await ensureBaseData();
}

const app = createApp();

const PORT = 5000;

const server = app.listen(PORT, () => {
  console.log(`[server] Rent It API running on http://localhost:${PORT} (${env.nodeEnv})`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`[fatal] Port ${PORT} is already in use. Please kill the process running on port ${PORT}.`);
    process.exit(1);
  }
});

process.on("unhandledRejection", (err) => {
  console.error("[fatal] Unhandled promise rejection:", err);
  server.close(() => process.exit(1));
});