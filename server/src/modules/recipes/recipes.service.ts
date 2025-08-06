import { injectable, inject } from "inversify";
import { TYPES } from "../../common/types";
import { CreateRecipeDto, CreateRecipeResponseDto } from "./dto";
import { CreateRecipeUseCase } from "./use-cases/create-recipe.use-case";

@injectable()
export class RecipesService {
  constructor(
    @inject(TYPES.CreateRecipeUseCase)
    private readonly createRecipeUseCase: CreateRecipeUseCase
  ) {}

  async createRecipe(createRecipeDto: CreateRecipeDto, userId: string): Promise<CreateRecipeResponseDto> {
    return await this.createRecipeUseCase.execute(createRecipeDto, userId);
  }
}
