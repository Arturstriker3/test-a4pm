import { injectable, inject } from "inversify";
import { TYPES } from "../../common/types";
import { RecipesRepository } from "./recipes.repository";

@injectable()
export class RecipesService {
  constructor(
    @inject(TYPES.RecipesRepository)
    private readonly recipesRepository: RecipesRepository
  ) {}

  // TODO: Implement methods
}
