import { injectable, inject } from "inversify";
import { TYPES } from "../../../common/types";
import { RecipesRepository } from "../recipes.repository";
import { RecipeDto } from "../dto/recipe.dto";
import { NotFoundException, ForbiddenException } from "../../../common/exceptions";
import { UserRole } from "../../users/entities/user.entity";

@injectable()
export class GetRecipeByIdUseCase {
	constructor(
		@inject(TYPES.RecipesRepository)
		private readonly recipesRepository: RecipesRepository
	) {}

	async execute(recipeId: string, userId: string, userRole: UserRole): Promise<RecipeDto> {
		const recipe = await this.recipesRepository.findByIdWithDetails(recipeId);

		if (!recipe) {
			throw new NotFoundException(`Receita com ID ${recipeId} não foi encontrada`);
		}

		// Verifica se o usuário tem permissão para ver a receita
		// Admin pode ver todas, usuários normais só as suas próprias
		if (userRole !== UserRole.ADMIN && recipe.id_usuarios !== userId) {
			throw new ForbiddenException("Você só pode visualizar suas próprias receitas");
		}

		return this.mapToDto(recipe);
	}

	private mapToDto(recipe: any): RecipeDto {
		return {
			id: recipe.id,
			nome: recipe.nome,
			ingredientes: recipe.ingredientes,
			modo_preparo: recipe.modo_preparo,
			tempo_preparo_minutos: recipe.tempo_preparo_minutos,
			porcoes: recipe.porcoes,
			id_categorias: recipe.id_categorias,
			categoria_nome: recipe.categoria_nome || "",
			id_usuarios: recipe.id_usuarios,
			usuario_nome: recipe.usuario_nome || "",
			criado_em: recipe.criado_em,
			alterado_em: recipe.alterado_em,
		};
	}
}
