import { injectable, inject } from "inversify";
import { TYPES } from "../../common/types";
import { GetCategoriesPaginatedUseCase, GetCategoriesPaginatedResult } from "./use-cases/get-categories-paginated.use-case";

@injectable()
export class CategoriesService {
	constructor(
		@inject(TYPES.GetCategoriesPaginatedUseCase)
		private readonly getCategoriesPaginatedUseCase: GetCategoriesPaginatedUseCase
	) {}

	async findAllPaginated(page: number, limit: number, offset: number): Promise<GetCategoriesPaginatedResult> {
		return this.getCategoriesPaginatedUseCase.execute(page, limit, offset);
	}
}
