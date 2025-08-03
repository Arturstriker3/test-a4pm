import { injectable, inject } from "inversify";
import { TYPES } from "../../common/types";
import { DatabaseService } from "../../app/database.service";
import { Recipe } from "./entities/recipe.entity";
import { CreateRecipeDto, UpdateRecipeDto } from "./dto/recipe.dto";

@injectable()
export class RecipesRepository {
  constructor(
    @inject(TYPES.DatabaseService)
    private readonly databaseService: DatabaseService
  ) {}

  // TODO: Implement methods
}
