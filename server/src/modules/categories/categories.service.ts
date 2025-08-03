import { injectable, inject } from "inversify";
import { TYPES } from "../../common/types";
import { CategoriesRepository } from "./categories.repository";

@injectable()
export class CategoriesService {
  constructor(
    @inject(TYPES.CategoriesRepository)
    private readonly categoriesRepository: CategoriesRepository
  ) {}

  // TODO: Implement methods
}
