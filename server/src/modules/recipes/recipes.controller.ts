import { injectable, inject } from "inversify";
import { TYPES } from "../../common/types";
import { RecipesService } from "./recipes.service";

@injectable()
export class RecipesController {
  constructor(
    @inject(TYPES.RecipesService)
    private readonly recipesService: RecipesService
  ) {}

  // TODO: Implement REST endpoints
}
