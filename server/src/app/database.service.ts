import { createConnection } from "../config/database";
import { MigrationRunner } from "../migrations/MigrationRunner";

export async function connectDatabase(): Promise<void> {
  await connectWithRetry();
  await runMigrations();
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function connectWithRetry(
  maxRetries: number = 5,
  delay: number = 2000
): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await testDatabaseConnection();
      console.log("✅ Database connected");
      return;
    } catch (error) {
      console.log(
        `⚠️  Database connection attempt ${attempt}/${maxRetries} failed`
      );

      if (attempt === maxRetries) {
        console.error("❌ Failed to connect to database after all retries");
        throw error;
      }

      console.log(`⏳ Retrying in ${delay / 1000}s...`);
      await sleep(delay);
      delay *= 1.5; // Exponential backoff
    }
  }
}

export async function testDatabaseConnection(): Promise<void> {
  const conn = await createConnection();
  await conn.ping();
  await conn.end();
}

async function runMigrations(): Promise<void> {
  const runner = new MigrationRunner();

  try {
    await runner.connect();
    await runner.runPendingMigrations();
  } catch (error) {
    console.error("❌ Migration execution failed:", error);
    throw error;
  } finally {
    await runner.disconnect();
  }
}
