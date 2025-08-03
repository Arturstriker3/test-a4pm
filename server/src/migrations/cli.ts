#!/usr/bin/env node

import { MigrationRunner } from "./MigrationRunner";

async function runMigrationCommand() {
  const args = process.argv.slice(2);
  const command = args[0];

  const runner = new MigrationRunner();

  try {
    await runner.connect();

    switch (command) {
      case "run":
      case "migrate":
        await runner.runPendingMigrations();
        break;

      case "rollback":
        await runner.rollbackLastMigration();
        break;

      case "status":
        await runner.getStatus();
        break;

      case "create":
        const migrationName = args[1];
        if (!migrationName) {
          console.error("❌ Migration name is required");
          console.log(
            "Usage: tsx src/migrations/cli.ts create <migration-name>"
          );
          process.exit(1);
        }
        await createMigrationFile(migrationName);
        break;

      default:
        console.log("📚 Available commands:");
        console.log("  run|migrate  - Run all pending migrations");
        console.log("  rollback     - Rollback the last migration");
        console.log("  status       - Show migration status");
        console.log("  create <name> - Create a new migration file");
        console.log("\nUsage: tsx src/migrations/cli.ts <command>");
        break;
    }
  } catch (error) {
    console.error("❌ Migration command failed:", error);
    process.exit(1);
  } finally {
    await runner.disconnect();
  }
}

async function createMigrationFile(name: string): Promise<void> {
  const timestamp = Date.now();
  const fileName = `${timestamp}_${name.replace(
    /[^a-zA-Z0-9]/g,
    "_"
  )}.migration.ts`;
  const filePath = `${__dirname}/files/${fileName}`;

  const template = `import { Connection } from "mysql2/promise";
import { Migration } from "../Migration.interface";

const migration: Migration = {
  name: "${timestamp}_${name}",
  timestamp: ${timestamp},

  async up(connection: Connection): Promise<void> {
    // TODO: Implement your migration logic here
    // Example:
    // await connection.execute(\`
    //   CREATE TABLE example_table (
    //     id INT AUTO_INCREMENT PRIMARY KEY,
    //     name VARCHAR(255) NOT NULL,
    //     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    //   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    // \`);
  },

  async down(connection: Connection): Promise<void> {
    // TODO: Implement your rollback logic here
    // Example:
    // await connection.execute(\`DROP TABLE IF EXISTS example_table\`);
  }
};

export default migration;
`;

  const fs = require("fs");
  fs.writeFileSync(filePath, template);

  console.log(`✅ Migration created: ${fileName}`);
  console.log(`📁 Path: ${filePath}`);
  console.log("📝 Please edit the file to implement your migration logic");
}

runMigrationCommand();
