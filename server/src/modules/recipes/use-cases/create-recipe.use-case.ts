import { injectable, inject } from "inversify";
import { TYPES } from "../../../common/types";
import { RecipesRepository } from "../recipes.repository";
import { CategoriesRepository } from "../../categories/categories.repository";
import { Recipe } from "../entities/recipe.entity";
import { CreateRecipeDto, CreateRecipeResponseDto } from "../dto";
import { RecipeBusinessRules } from "../rules/recipe.rules";
import { v4 as uuidv4 } from "uuid";

/**
 * Use case responsável por criar novas receitas no sistema.
 * Valida dados de entrada e persiste a receita no banco de dados.
 *
 * @param request - Dados da receita para criação (CreateRecipeDto)
 * @param userId - ID do usuário que está criando a receita
 * @returns Promise<CreateRecipeResponseDto> - Dados da receita criada
 * @throws ValidationError - Quando os dados do DTO são inválidos (class-validator)
 */
@injectable()
export class CreateRecipeUseCase {
	constructor(
		@inject(TYPES.RecipesRepository)
		private readonly recipesRepository: RecipesRepository,
		@inject(TYPES.CategoriesRepository)
		private readonly categoriesRepository: CategoriesRepository
	) {}

	async execute(request: CreateRecipeDto, userId: string): Promise<CreateRecipeResponseDto> {
		await this.validateBusinessRules(request, userId);
		const recipe = this.createRecipeEntity(request, userId);
		const savedRecipe = await this.recipesRepository.save(recipe);

		return this.mapToResponseDto(savedRecipe);
	}

	private async validateBusinessRules(request: CreateRecipeDto, userId: string): Promise<void> {
		RecipeBusinessRules.validateCategoryIsRequired(request.id_categorias);
		const category = await this.categoriesRepository.findById(request.id_categorias);
		RecipeBusinessRules.validateCategoryExists(category, request.id_categorias);
		RecipeBusinessRules.validateReasonablePrepTime(request.tempo_preparo_minutos);
		RecipeBusinessRules.validateReasonablePortions(request.porcoes);
	}

	private createRecipeEntity(request: CreateRecipeDto, userId: string): Recipe {
		const now = new Date();

		return {
			id: uuidv4(),
			id_usuarios: userId,
			id_categorias: request.id_categorias,
			nome: request.nome,
			tempo_preparo_minutos: request.tempo_preparo_minutos || null,
			porcoes: request.porcoes || null,
			modo_preparo: request.modo_preparo,
			ingredientes: request.ingredientes || null,
			criado_em: now,
			alterado_em: now,
		};
	}

	private mapToResponseDto(recipe: Recipe): CreateRecipeResponseDto {
		return new CreateRecipeResponseDto({
			id: recipe.id,
			id_usuarios: recipe.id_usuarios,
			id_categorias: recipe.id_categorias,
			nome: recipe.nome,
			tempo_preparo_minutos: recipe.tempo_preparo_minutos,
			porcoes: recipe.porcoes,
			modo_preparo: recipe.modo_preparo,
			ingredientes: recipe.ingredientes,
			criado_em: recipe.criado_em,
			alterado_em: recipe.alterado_em,
		});
	}
}
