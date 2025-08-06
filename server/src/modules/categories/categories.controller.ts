import { injectable, inject } from "inversify";
import { TYPES } from "../../common/types";
import { CategoriesService } from "./categories.service";
import { Controller } from "../../common/decorators";

@injectable()
@Controller("/categories")
export class CategoriesController {
  constructor(
    @inject(TYPES.CategoriesService)
    private readonly categoriesService: CategoriesService
  ) {}

  // TODO: Implement methods
}
