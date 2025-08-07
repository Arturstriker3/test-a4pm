import { injectable, inject } from "inversify";
import { TYPES } from "../../../common/types";
import { RecipesRepository } from "../recipes.repository";
import { UserRole } from "../../users/entities/user.entity";
import { NotFoundException, ForbiddenException } from "../../../common/exceptions";

@injectable()
export class DeleteRecipeUseCase {
	constructor(
		@inject(TYPES.RecipesRepository)
		private readonly recipesRepository: RecipesRepository
	) {}

	async execute(recipeId: string, userId: string, userRole: UserRole): Promise<void> {
		const existingRecipe = await this.recipesRepository.findById(recipeId);
		if (!existingRecipe) {
			throw new NotFoundException("Receita não encontrada");
		}

		if (userRole !== UserRole.ADMIN && existingRecipe.id_usuarios !== userId) {
			throw new ForbiddenException("Você só pode deletar suas próprias receitas");
		}

		await this.recipesRepository.delete(recipeId);
	}
}
