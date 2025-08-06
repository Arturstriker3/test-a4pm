import { Connection } from "mysql2/promise";
import { createConnection } from "../config/database";
import { Migration } from "./Migration.interface";
import fs from "fs";
import path from "path";

export class MigrationRunner {
  private connection: Connection | null = null;

  async connect(): Promise<void> {
    this.connection = await createConnection();
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
    }
  }

  private async ensureMigrationsTable(): Promise<void> {
    if (!this.connection) {
      throw new Error("Database connection not established");
    }

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        timestamp BIGINT NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_timestamp (timestamp),
        INDEX idx_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await this.connection.execute(createTableQuery);
  }

  private async getExecutedMigrations(): Promise<string[]> {
    if (!this.connection) {
      throw new Error("Database connection not established");
    }

    const [rows] = await this.connection.execute("SELECT name FROM migrations ORDER BY timestamp ASC");

    return (rows as any[]).map((row) => row.name);
  }

  private async recordMigration(migration: Migration): Promise<void> {
    if (!this.connection) {
      throw new Error("Database connection not established");
    }

    await this.connection.execute("INSERT INTO migrations (name, timestamp) VALUES (?, ?)", [
      migration.name,
      migration.timestamp,
    ]);
  }

  private async removeMigrationRecord(migrationName: string): Promise<void> {
    if (!this.connection) {
      throw new Error("Database connection not established");
    }

    await this.connection.execute("DELETE FROM migrations WHERE name = ?", [migrationName]);
  }

  private async loadMigrations(): Promise<Migration[]> {
    const migrationsDir = path.join(__dirname, "files");
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".migration.ts") || file.endsWith(".migration.js"))
      .sort();

    const migrations: Migration[] = [];

    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      try {
        const migrationModule = require(filePath);
        const migration = migrationModule.default || migrationModule;

        if (migration && typeof migration.up === "function" && typeof migration.down === "function") {
          migrations.push(migration);
        } else {
          console.warn(`⚠️  Migration file ${file} does not export a valid migration object`);
        }
      } catch (error) {
        console.error(`❌ Error loading migration ${file}:`, error);
      }
    }

    return migrations.sort((a, b) => a.timestamp - b.timestamp);
  }

  async runPendingMigrations(): Promise<void> {
    console.log("🔄 Running pending migrations...");

    await this.ensureMigrationsTable();

    const executedMigrations = await this.getExecutedMigrations();
    const allMigrations = await this.loadMigrations();

    const pendingMigrations = allMigrations.filter((migration) => !executedMigrations.includes(migration.name));

    if (pendingMigrations.length === 0) {
      console.log("✅ No pending migrations found");
      return;
    }

    console.log(`📋 Found ${pendingMigrations.length} pending migration(s)`);

    for (const migration of pendingMigrations) {
      try {
        console.log(`⏳ Running migration: ${migration.name}`);

        if (!this.connection) {
          throw new Error("Database connection lost");
        }

        await this.connection.beginTransaction();

        await migration.up(this.connection);
        await this.recordMigration(migration);

        await this.connection.commit();

        console.log(`✅ Migration completed: ${migration.name}`);
      } catch (error) {
        if (this.connection) {
          await this.connection.rollback();
        }
        console.error(`❌ Migration failed: ${migration.name}`, error);
        throw error;
      }
    }

    console.log("✅ All pending migrations completed successfully!");
  }

  async rollbackLastMigration(): Promise<void> {
    console.log("🔄 Rolling back last migration...");

    await this.ensureMigrationsTable();

    const executedMigrations = await this.getExecutedMigrations();

    if (executedMigrations.length === 0) {
      console.log("ℹ️  No migrations to rollback");
      return;
    }

    const lastMigrationName = executedMigrations[executedMigrations.length - 1];
    const allMigrations = await this.loadMigrations();
    const migrationToRollback = allMigrations.find((m) => m.name === lastMigrationName);

    if (!migrationToRollback) {
      throw new Error(`Migration file not found for: ${lastMigrationName}`);
    }

    try {
      console.log(`⏳ Rolling back migration: ${migrationToRollback.name}`);

      if (!this.connection) {
        throw new Error("Database connection lost");
      }

      await this.connection.beginTransaction();

      await migrationToRollback.down(this.connection);
      await this.removeMigrationRecord(migrationToRollback.name);

      await this.connection.commit();

      console.log(`✅ Migration rolled back: ${migrationToRollback.name}`);
    } catch (error) {
      if (this.connection) {
        await this.connection.rollback();
      }
      console.error(`❌ Rollback failed: ${migrationToRollback.name}`, error);
      throw error;
    }
  }

  async getStatus(): Promise<void> {
    await this.ensureMigrationsTable();

    const executedMigrations = await this.getExecutedMigrations();
    const allMigrations = await this.loadMigrations();

    console.log("\n📊 Migration Status:");
    console.log("==================");

    if (allMigrations.length === 0) {
      console.log("ℹ️  No migration files found");
      return;
    }

    for (const migration of allMigrations) {
      const status = executedMigrations.includes(migration.name) ? "✅ Executed" : "⏳ Pending";
      const date = new Date(migration.timestamp).toISOString();
      console.log(`${status} | ${migration.name} | ${date}`);
    }

    const pendingCount = allMigrations.length - executedMigrations.length;
    console.log(
      `\n📈 Total: ${allMigrations.length} | Executed: ${executedMigrations.length} | Pending: ${pendingCount}`
    );
  }
}
