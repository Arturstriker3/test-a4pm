import { injectable, inject } from "inversify";
import { TYPES } from "../../common/types";
import { CreateRecipeDto, CreateRecipeResponseDto, UpdateRecipeDto, UpdateRecipeResponseDto, RecipeDto } from "./dto";
import { CreateRecipeUseCase } from "./use-cases/create-recipe.use-case";
import { UpdateRecipeUseCase } from "./use-cases/update-recipe.use-case";
import { GetRecipesPaginatedUseCase } from "./use-cases/get-recipes-paginated.use-case";
import { UserRole } from "../users/entities/user.entity";

@injectable()
export class RecipesService {
  constructor(
    @inject(TYPES.CreateRecipeUseCase)
    private readonly createRecipeUseCase: CreateRecipeUseCase,
    @inject(TYPES.UpdateRecipeUseCase)
    private readonly updateRecipeUseCase: UpdateRecipeUseCase,
    @inject(TYPES.GetRecipesPaginatedUseCase)
    private readonly getRecipesPaginatedUseCase: GetRecipesPaginatedUseCase
  ) {}

  async createRecipe(createRecipeDto: CreateRecipeDto, userId: string): Promise<CreateRecipeResponseDto> {
    return await this.createRecipeUseCase.execute(createRecipeDto, userId);
  }

  async updateRecipe(
    recipeId: string,
    updateRecipeDto: UpdateRecipeDto,
    userId: string,
    userRole: UserRole
  ): Promise<UpdateRecipeResponseDto> {
    return await this.updateRecipeUseCase.execute(recipeId, updateRecipeDto, userId, userRole);
  }

  async findAllPaginated(
    page: number,
    limit: number,
    offset: number,
    userId: string,
    userRole: UserRole
  ): Promise<{ items: RecipeDto[]; total: number }> {
    return await this.getRecipesPaginatedUseCase.execute(page, limit, offset, userId, userRole);
  }
}
