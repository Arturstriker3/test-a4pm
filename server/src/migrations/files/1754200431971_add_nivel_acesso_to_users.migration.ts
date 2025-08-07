import { Connection } from "mysql2/promise";
import { Migration } from "../Migration.interface";

const migration: Migration = {
	name: "1754200431971_add_nivel_acesso_to_users",
	timestamp: 1754200431971,

	async up(connection: Connection): Promise<void> {
		await connection.execute(`
      ALTER TABLE teste_receitas_rg_sistemas.usuarios 
      ADD COLUMN nivel_acesso ENUM('ADMIN', 'DEFAULT') NOT NULL DEFAULT 'DEFAULT';
    `);
	},

	async down(connection: Connection): Promise<void> {
		await connection.execute(`
      ALTER TABLE teste_receitas_rg_sistemas.usuarios 
      DROP COLUMN nivel_acesso;
    `);
	},
};

export default migration;
