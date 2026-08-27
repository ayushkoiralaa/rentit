// Validates required environment variables at startup so the app fails
// fast and loudly instead of behaving unpredictably in production.
const REQUIRED_VARS = ["MONGO_URI", "JWT_SECRET"];

export function validateEnv() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key] || !process.env[key].trim());

  if (missing.length > 0) {
    console.error(
      `\n[startup error] Missing required environment variable(s): ${missing.join(", ")}\n` +
        `Copy .env.example to .env and fill these in before starting the server.\n`
    );
    process.exit(1);
  }

  if (process.env.JWT_SECRET.length < 16) {
    console.warn(
      "[startup warning] JWT_SECRET is short. Use a long random string in production."
    );
  }
}

export const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  platformFeePercent: Number(process.env.PLATFORM_FEE_PERCENT) || 10,
  maxImageSizeMb: Number(process.env.MAX_IMAGE_SIZE_MB) || 5,
  maxImagesPerItem: Number(process.env.MAX_IMAGES_PER_ITEM) || 8,
  // Auto-creates demo login accounts + base categories on every server
  // start if they don't already exist. Defaults on; set AUTO_SEED=false in
  // .env to disable (recommended for a real production deployment).
  autoSeed: process.env.AUTO_SEED !== "false",
};
