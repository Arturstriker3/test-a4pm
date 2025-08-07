import { injectable, inject } from "inversify";
import { TYPES } from "../../../common/types";
import { RecipesRepository } from "../recipes.repository";
import { RecipeDto } from "../dto";
import { UserRole } from "../../users/entities/user.entity";

@injectable()
export class GetRecipesPaginatedUseCase {
	constructor(
		@inject(TYPES.RecipesRepository)
		private readonly recipesRepository: RecipesRepository
	) {}

	async execute(page: number, limit: number, offset: number, userId: string, userRole: UserRole, search?: string, categoryId?: string): Promise<{ items: RecipeDto[]; total: number }> {
		if (userRole === UserRole.ADMIN) {
			return await this.recipesRepository.findAllPaginated(page, limit, offset, search, categoryId);
		}

		return await this.recipesRepository.findByUserIdPaginated(userId, page, limit, offset, search, categoryId);
	}
}
