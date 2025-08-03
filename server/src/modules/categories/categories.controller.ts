import { injectable, inject } from "inversify";
import { TYPES } from "../../common/types";
import { CategoriesService } from "./categories.service";

@injectable()
export class CategoriesController {
  constructor(
    @inject(TYPES.CategoriesService)
    private readonly categoriesService: CategoriesService
  ) {}

  // TODO: Implement REST endpoints
}
