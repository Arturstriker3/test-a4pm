import { injectable, inject } from "inversify";
import { TYPES } from "../../../common/types";
import { CategoriesRepository } from "../categories.repository";
import { CategoryDto } from "../dto/category.dto";

export interface GetCategoriesPaginatedResult {
  items: CategoryDto[];
  total: number;
}

@injectable()
export class GetCategoriesPaginatedUseCase {
  constructor(
    @inject(TYPES.CategoriesRepository)
    private readonly categoriesRepository: CategoriesRepository
  ) {}

  async execute(page: number, limit: number, offset: number): Promise<GetCategoriesPaginatedResult> {
    const [items, total] = await Promise.all([
      this.categoriesRepository.findWithPagination(offset, limit),
      this.categoriesRepository.count(),
    ]);

    const categoryDtos = items.map((category) => new CategoryDto({ id: category.id, nome: category.nome }));

    return {
      items: categoryDtos,
      total,
    };
  }
}
