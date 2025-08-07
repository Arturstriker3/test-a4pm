import { injectable, inject } from "inversify";
import { TYPES } from "../../../common/types";
import { UpdateRecipeDto } from "../dto/update-recipe.dto";
import { UpdateRecipeResponseDto } from "../dto/update-recipe-response.dto";
import { RecipesRepository } from "../recipes.repository";
import { CategoriesRepository } from "../../categories/categories.repository";
import { Recipe } from "../entities/recipe.entity";
import { RecipeBusinessRules } from "../rules/recipe.rules";
import { NotFoundException, ForbiddenException } from "../../../common/exceptions";
import { UserRole } from "../../users/entities/user.entity";

@injectable()
export class UpdateRecipeUseCase {
	constructor(
		@inject(TYPES.RecipesRepository) private readonly recipesRepository: RecipesRepository,
		@inject(TYPES.CategoriesRepository) private readonly categoriesRepository: CategoriesRepository
	) {}

	async execute(recipeId: string, request: UpdateRecipeDto, userId: string, userRole: UserRole): Promise<UpdateRecipeResponseDto> {
		const existingRecipe = await this.recipesRepository.findById(recipeId);
		if (!existingRecipe) {
			throw new NotFoundException(`Receita com ID ${recipeId} não foi encontrada`);
		}

		if (userRole !== UserRole.ADMIN && existingRecipe.id_usuarios !== userId) {
			throw new ForbiddenException("Você só pode editar suas próprias receitas");
		}

		if (request.id_categorias || request.tempo_preparo_minutos !== undefined || request.porcoes !== undefined) {
			await this.validateBusinessRules(request, existingRecipe);
		}

		const updatedRecipe = this.updateRecipeEntity(existingRecipe, request);
		const savedRecipe = await this.recipesRepository.update(recipeId, updatedRecipe);

		return this.mapToResponseDto(savedRecipe);
	}

	private async validateBusinessRules(request: UpdateRecipeDto, existingRecipe: Recipe): Promise<void> {
		if (request.id_categorias) {
			RecipeBusinessRules.validateCategoryIsRequired(request.id_categorias);
			const category = await this.categoriesRepository.findById(request.id_categorias);
			RecipeBusinessRules.validateCategoryExists(category, request.id_categorias);
		}

		if (request.tempo_preparo_minutos !== undefined) {
			RecipeBusinessRules.validateReasonablePrepTime(request.tempo_preparo_minutos);
		}

		if (request.porcoes !== undefined) {
			RecipeBusinessRules.validateReasonablePortions(request.porcoes);
		}
	}

	private updateRecipeEntity(existingRecipe: Recipe, request: UpdateRecipeDto): Partial<Recipe> {
		const updates: Partial<Recipe> = {};

		if (request.nome) updates.nome = request.nome;
		if (request.id_categorias) updates.id_categorias = request.id_categorias;
		if (request.tempo_preparo_minutos !== undefined) updates.tempo_preparo_minutos = request.tempo_preparo_minutos;
		if (request.porcoes !== undefined) updates.porcoes = request.porcoes;
		if (request.modo_preparo) updates.modo_preparo = request.modo_preparo;
		if (request.ingredientes !== undefined) updates.ingredientes = request.ingredientes;

		return updates;
	}

	private mapToResponseDto(recipe: Recipe): UpdateRecipeResponseDto {
		return {
			id: recipe.id,
			nome: recipe.nome,
			id_categorias: recipe.id_categorias,
			tempo_preparo_minutos: recipe.tempo_preparo_minutos ?? undefined,
			porcoes: recipe.porcoes ?? undefined,
			modo_preparo: recipe.modo_preparo,
			ingredientes: recipe.ingredientes ?? undefined,
			id_usuario: recipe.id_usuarios,
			created_at: recipe.criado_em.toISOString(),
			updated_at: recipe.alterado_em.toISOString(),
		};
	}
}
