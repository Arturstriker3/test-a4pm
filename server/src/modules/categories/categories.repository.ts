import { injectable, inject } from "inversify";
import { TYPES } from "../../common/types";
import { DatabaseService } from "../../app/database.service";
import { Category } from "./entities/category.entity";

@injectable()
export class CategoriesRepository {
	constructor(
		@inject(TYPES.DatabaseService)
		private readonly databaseService: DatabaseService
	) {}

	async findWithPagination(offset: number, limit: number): Promise<Category[]> {
		const connection = await this.databaseService.getConnection();

		const query = `
      SELECT id, nome
      FROM teste_receitas_rg_sistemas.categorias 
      ORDER BY nome ASC
      LIMIT ? OFFSET ?
    `;

		const [rows] = await connection.execute(query, [limit, offset]);
		const categories = rows as any[];

		return categories.map((row) => ({
			id: row.id,
			nome: row.nome,
		}));
	}

	async findById(id: string): Promise<Category | null> {
		const connection = await this.databaseService.getConnection();

		const query = `
      SELECT id, nome
      FROM teste_receitas_rg_sistemas.categorias 
      WHERE id = ?
    `;

		const [rows] = await connection.execute(query, [id]);
		const results = rows as any[];

		return results.length > 0
			? {
					id: results[0].id,
					nome: results[0].nome,
				}
			: null;
	}

	async count(): Promise<number> {
		const connection = await this.databaseService.getConnection();

		const query = `
      SELECT COUNT(*) as total
      FROM teste_receitas_rg_sistemas.categorias
    `;

		const [rows] = await connection.execute(query);
		const result = rows as any[];
		return result[0].total;
	}
}
