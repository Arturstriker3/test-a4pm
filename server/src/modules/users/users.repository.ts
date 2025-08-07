import { injectable, inject } from "inversify";
import { TYPES } from "../../common/types";
import { DatabaseService } from "../../app/database.service";
import { User } from "./entities/user.entity";

@injectable()
export class UsersRepository {
	constructor(
		@inject(TYPES.DatabaseService)
		private readonly databaseService: DatabaseService
	) {}

	async save(user: User): Promise<User> {
		const connection = await this.databaseService.getConnection();

		const query = `
      INSERT INTO teste_receitas_rg_sistemas.usuarios 
      (id, nome, login, senha, nivel_acesso, recovery_token, criado_em, alterado_em)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

		const values = [user.id, user.nome, user.login, user.senha, user.nivel_acesso, user.recovery_token, user.criado_em, user.alterado_em];

		await connection.execute(query, values);
		return user;
	}

	async findByLogin(login: string): Promise<User | null> {
		const connection = await this.databaseService.getConnection();

		const query = `
      SELECT id, nome, login, senha, nivel_acesso, recovery_token, criado_em, alterado_em
      FROM teste_receitas_rg_sistemas.usuarios 
      WHERE login = ?
    `;

		const [rows] = await connection.execute(query, [login]);
		const users = rows as any[];

		if (users.length === 0) {
			return null;
		}

		const row = users[0];
		return {
			id: row.id,
			nome: row.nome,
			login: row.login,
			senha: row.senha,
			nivel_acesso: row.nivel_acesso,
			recovery_token: row.recovery_token,
			criado_em: row.criado_em,
			alterado_em: row.alterado_em,
		};
	}

	async findById(id: string): Promise<User | null> {
		const connection = await this.databaseService.getConnection();

		const query = `
      SELECT id, nome, login, senha, nivel_acesso, recovery_token, criado_em, alterado_em
      FROM teste_receitas_rg_sistemas.usuarios 
      WHERE id = ?
    `;

		const [rows] = await connection.execute(query, [id]);
		const users = rows as any[];

		if (users.length === 0) {
			return null;
		}

		const row = users[0];
		return {
			id: row.id,
			nome: row.nome,
			login: row.login,
			senha: row.senha,
			nivel_acesso: row.nivel_acesso,
			recovery_token: row.recovery_token,
			criado_em: row.criado_em,
			alterado_em: row.alterado_em,
		};
	}

	async updateRecoveryToken(userId: string, recoveryToken: string | null): Promise<void> {
		const connection = await this.databaseService.getConnection();

		const query = `
      UPDATE teste_receitas_rg_sistemas.usuarios 
      SET recovery_token = ?, alterado_em = NOW()
      WHERE id = ?
    `;

		await connection.execute(query, [recoveryToken, userId]);
	}

	async findWithPagination(offset: number, limit: number): Promise<User[]> {
		const connection = await this.databaseService.getConnection();

		const query = `
      SELECT id, nome, login, senha, nivel_acesso, recovery_token, criado_em, alterado_em
      FROM teste_receitas_rg_sistemas.usuarios 
      ORDER BY criado_em DESC
      LIMIT ? OFFSET ?
    `;

		const [rows] = await connection.execute(query, [limit, offset]);
		const users = rows as any[];

		return users.map((row) => ({
			id: row.id,
			nome: row.nome,
			login: row.login,
			senha: row.senha,
			nivel_acesso: row.nivel_acesso,
			recovery_token: row.recovery_token,
			criado_em: row.criado_em,
			alterado_em: row.alterado_em,
		}));
	}

	async count(): Promise<number> {
		const connection = await this.databaseService.getConnection();

		const query = `
      SELECT COUNT(*) as total
      FROM teste_receitas_rg_sistemas.usuarios
    `;

		const [rows] = await connection.execute(query);
		const result = rows as any[];

		return result[0].total;
	}
}
