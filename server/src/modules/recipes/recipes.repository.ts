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

    const values = [
      recipe.id,
      recipe.id_usuarios,
      recipe.id_categorias,
      recipe.nome,
      recipe.tempo_preparo_minutos,
      recipe.porcoes,
      recipe.modo_preparo,
      recipe.ingredientes,
      recipe.criado_em,
      recipe.alterado_em,
    ];

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
}
