import { injectable, inject } from "inversify";
import { TYPES } from "../../common/types";
import { DatabaseService } from "../../app/database.service";
import { Recipe } from "./entities/recipe.entity";

@injectable()
export class RecipesRepository {
	constructor(
		@inject(TYPES.DatabaseService)
		private readonly databaseService: DatabaseService
	) {}

	async save(recipe: Recipe): Promise<Recipe> {
		const connection = await this.databaseService.getConnection();

		const query = `
      INSERT INTO teste_receitas_rg_sistemas.receitas (
        id, 
        id_usuarios, 
        id_categorias, 
        nome, 
        tempo_preparo_minutos, 
        porcoes, 
        modo_preparo, 
        ingredientes, 
        criado_em, 
        alterado_em
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

		const values = [recipe.id, recipe.id_usuarios, recipe.id_categorias, recipe.nome, recipe.tempo_preparo_minutos, recipe.porcoes, recipe.modo_preparo, recipe.ingredientes, recipe.criado_em, recipe.alterado_em];

		await connection.execute(query, values);
		return recipe;
	}

	async findById(id: string): Promise<Recipe | null> {
		const connection = await this.databaseService.getConnection();

		const query = `
      SELECT 
        id, 
        id_usuarios, 
        id_categorias, 
        nome, 
        tempo_preparo_minutos, 
        porcoes, 
        modo_preparo, 
        ingredientes, 
        criado_em, 
        alterado_em
      FROM teste_receitas_rg_sistemas.receitas 
      WHERE id = ?
    `;

		const [rows] = await connection.execute(query, [id]);
		const results = rows as any[];

		return results.length > 0 ? (results[0] as Recipe) : null;
	}

	async findByIdWithDetails(id: string): Promise<any | null> {
		const connection = await this.databaseService.getConnection();

		const query = `
      SELECT 
        r.id,
        r.nome,
        r.ingredientes,
        r.modo_preparo,
        r.tempo_preparo_minutos,
        r.porcoes,
        r.id_categorias,
        r.id_usuarios,
        r.criado_em,
        r.alterado_em,
        c.nome as categoria_nome,
        u.nome as usuario_nome
      FROM teste_receitas_rg_sistemas.receitas r
      LEFT JOIN teste_receitas_rg_sistemas.categorias c ON r.id_categorias = c.id
      LEFT JOIN teste_receitas_rg_sistemas.usuarios u ON r.id_usuarios = u.id
      WHERE r.id = ?
    `;

		const [rows] = await connection.execute(query, [id]);
		const results = rows as any[];

		return results.length > 0 ? results[0] : null;
	}

	async findByUserId(userId: string): Promise<Recipe[]> {
		const connection = await this.databaseService.getConnection();

		const query = `
      SELECT 
        id, 
        id_usuarios, 
        id_categorias, 
        nome, 
        tempo_preparo_minutos, 
        porcoes, 
        modo_preparo, 
        ingredientes, 
        criado_em, 
        alterado_em
      FROM teste_receitas_rg_sistemas.receitas 
      WHERE id_usuarios = ?
      ORDER BY criado_em DESC
    `;

		const [rows] = await connection.execute(query, [userId]);
		const results = rows as any[];

		return results as Recipe[];
	}

	async update(id: string, updates: Partial<Recipe>): Promise<Recipe> {
		const connection = await this.databaseService.getConnection();

		const fields: string[] = [];
		const values: any[] = [];

		if (updates.nome) {
			fields.push("nome = ?");
			values.push(updates.nome);
		}
		if (updates.id_categorias) {
			fields.push("id_categorias = ?");
			values.push(updates.id_categorias);
		}
		if (updates.tempo_preparo_minutos !== undefined) {
			fields.push("tempo_preparo_minutos = ?");
			values.push(updates.tempo_preparo_minutos);
		}
		if (updates.porcoes !== undefined) {
			fields.push("porcoes = ?");
			values.push(updates.porcoes);
		}
		if (updates.modo_preparo) {
			fields.push("modo_preparo = ?");
			values.push(updates.modo_preparo);
		}
		if (updates.ingredientes !== undefined) {
			fields.push("ingredientes = ?");
			values.push(updates.ingredientes);
		}

		fields.push("alterado_em = NOW()");
		values.push(id);

		const query = `
      UPDATE teste_receitas_rg_sistemas.receitas 
      SET ${fields.join(", ")} 
      WHERE id = ?
    `;

		await connection.execute(query, values);

		const updatedRecipe = await this.findById(id);
		if (!updatedRecipe) {
			throw new Error(`Receita com ID ${id} não foi encontrada após atualização`);
		}

		return updatedRecipe;
	}

	async findAllPaginated(page: number, limit: number, offset: number): Promise<{ items: any[]; total: number }> {
		const connection = await this.databaseService.getConnection();

		const countQuery = `
      SELECT COUNT(*) as total 
      FROM teste_receitas_rg_sistemas.receitas r
    `;

		const dataQuery = `
      SELECT 
        r.id,
        r.nome,
        r.ingredientes,
        r.modo_preparo,
        r.tempo_preparo_minutos,
        r.porcoes,
        r.id_categorias,
        r.id_usuarios,
        r.criado_em,
        r.alterado_em,
        c.nome as categoria_nome,
        u.nome as usuario_nome
      FROM teste_receitas_rg_sistemas.receitas r
      LEFT JOIN teste_receitas_rg_sistemas.categorias c ON r.id_categorias = c.id
      LEFT JOIN teste_receitas_rg_sistemas.usuarios u ON r.id_usuarios = u.id
      ORDER BY r.criado_em DESC
      LIMIT ? OFFSET ?
    `;

		const [countResult] = await connection.execute(countQuery);
		const [dataResult] = await connection.execute(dataQuery, [limit, offset]);

		const total = (countResult as any[])[0].total;
		const items = dataResult as any[];

		return { items, total };
	}

	async findByUserIdPaginated(userId: string, page: number, limit: number, offset: number): Promise<{ items: any[]; total: number }> {
		const connection = await this.databaseService.getConnection();

		const countQuery = `
      SELECT COUNT(*) as total 
      FROM teste_receitas_rg_sistemas.receitas r
      WHERE r.id_usuarios = ?
    `;

		const dataQuery = `
      SELECT 
        r.id,
        r.nome,
        r.ingredientes,
        r.modo_preparo,
        r.tempo_preparo_minutos,
        r.porcoes,
        r.id_categorias,
        r.id_usuarios,
        r.criado_em,
        r.alterado_em,
        c.nome as categoria_nome,
        u.nome as usuario_nome
      FROM teste_receitas_rg_sistemas.receitas r
      LEFT JOIN teste_receitas_rg_sistemas.categorias c ON r.id_categorias = c.id
      LEFT JOIN teste_receitas_rg_sistemas.usuarios u ON r.id_usuarios = u.id
      WHERE r.id_usuarios = ?
      ORDER BY r.criado_em DESC
      LIMIT ? OFFSET ?
    `;

		const [countResult] = await connection.execute(countQuery, [userId]);
		const [dataResult] = await connection.execute(dataQuery, [userId, limit, offset]);

		const total = (countResult as any[])[0].total;
		const items = dataResult as any[];

		return { items, total };
	}

	async delete(id: string): Promise<void> {
		const connection = await this.databaseService.getConnection();

		const query = `
      DELETE FROM teste_receitas_rg_sistemas.receitas 
      WHERE id = ?
    `;

		await connection.execute(query, [id]);
	}
}
