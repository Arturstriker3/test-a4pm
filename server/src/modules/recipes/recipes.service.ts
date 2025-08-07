import { injectable, inject } from "inversify";
import { TYPES } from "../../common/types";
import { CreateRecipeDto, CreateRecipeResponseDto, UpdateRecipeDto, UpdateRecipeResponseDto, RecipeDto } from "./dto";
import { CreateRecipeUseCase } from "./use-cases/create-recipe.use-case";
import { UpdateRecipeUseCase } from "./use-cases/update-recipe.use-case";
import { GetRecipesPaginatedUseCase } from "./use-cases/get-recipes-paginated.use-case";
import { GetRecipeByIdUseCase } from "./use-cases/get-recipe-by-id.use-case";
import { DeleteRecipeUseCase } from "./use-cases/delete-recipe.use-case";
import { UserRole } from "../users/entities/user.entity";

@injectable()
export class RecipesService {
	constructor(
		@inject(TYPES.CreateRecipeUseCase) private createRecipeUseCase: CreateRecipeUseCase,
		@inject(TYPES.UpdateRecipeUseCase) private updateRecipeUseCase: UpdateRecipeUseCase,
		@inject(TYPES.GetRecipesPaginatedUseCase) private getRecipesPaginatedUseCase: GetRecipesPaginatedUseCase,
		@inject(TYPES.GetRecipeByIdUseCase) private getRecipeByIdUseCase: GetRecipeByIdUseCase,
		@inject(TYPES.DeleteRecipeUseCase) private deleteRecipeUseCase: DeleteRecipeUseCase
	) {}

	async createRecipe(createRecipeDto: CreateRecipeDto, userId: string): Promise<CreateRecipeResponseDto> {
		return await this.createRecipeUseCase.execute(createRecipeDto, userId);
	}

	async getRecipeById(recipeId: string, userId: string, userRole: UserRole): Promise<RecipeDto> {
		return await this.getRecipeByIdUseCase.execute(recipeId, userId, userRole);
	}

	async updateRecipe(recipeId: string, updateRecipeDto: UpdateRecipeDto, userId: string, userRole: UserRole): Promise<UpdateRecipeResponseDto> {
		return await this.updateRecipeUseCase.execute(recipeId, updateRecipeDto, userId, userRole);
	}

	async findAllPaginated(page: number, limit: number, offset: number, userId: string, userRole: UserRole, search?: string, categoryId?: string): Promise<{ items: RecipeDto[]; total: number }> {
		return await this.getRecipesPaginatedUseCase.execute(page, limit, offset, userId, userRole, search, categoryId);
	}

	async deleteRecipe(recipeId: string, userId: string, userRole: UserRole): Promise<Boolean> {
		await this.deleteRecipeUseCase.execute(recipeId, userId, userRole);
		return true;
	}
}
