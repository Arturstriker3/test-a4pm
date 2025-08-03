import { Connection } from "mysql2/promise";
import { Migration } from "../Migration.interface";

const migration: Migration = {
  name: "1754196866198_add_recovery_token_to_users",
  timestamp: 1754196866198,

  async up(connection: Connection): Promise<void> {
    await connection.execute(`
      ALTER TABLE teste_receitas_rg_sistemas.usuarios 
      ADD COLUMN recovery_token VARCHAR(255) NULL,
      ADD COLUMN recovery_token_expires DATETIME NULL,
      ADD INDEX idx_recovery_token (recovery_token);
    `);
  },

  async down(connection: Connection): Promise<void> {
    await connection.execute(`
      ALTER TABLE teste_receitas_rg_sistemas.usuarios 
      DROP INDEX idx_recovery_token,
      DROP COLUMN recovery_token_expires,
      DROP COLUMN recovery_token;
    `);
  },
};

export default migration;
