import { injectable, inject } from "inversify";
import { TYPES } from "../../common/types";
import { CategoriesService } from "./categories.service";
import { Controller, Get, Query } from "../../common/decorators";
import { RouteAccess, RouteAccessType } from "../auth/decorators/access.decorators";
import { ApiResponse, PaginatedData } from "../../common/responses";
import { PaginationParamsDto } from "../../common/dto";
import { HandleClassExceptions, ApiOperation, ApiSuccessResponse, ApiUnauthorizedResponse, ApiQuery } from "../../common/decorators";
import { CategoryDto } from "./dto/category.dto";

@injectable()
@Controller("/categories")
@HandleClassExceptions
export class CategoriesController {
	constructor(
		@inject(TYPES.CategoriesService)
		private readonly categoriesService: CategoriesService
	) {}

	@Get("/")
	@RouteAccess(RouteAccessType.AUTHENTICATED)
	@ApiOperation({
		summary: "Listar categorias com paginação",
		description: "Retorna uma lista paginada de categorias. Requer autenticação mas qualquer usuário pode acessar.",
	})
	@ApiQuery({
		name: "page",
		type: "number",
		description: "Número da página (baseado em 1)",
		required: false,
		example: 1,
		minimum: 1,
		default: 1,
	})
	@ApiQuery({
		name: "limit",
		type: "number",
		description: "Número de itens por página",
		required: false,
		example: 10,
		minimum: 1,
		maximum: 100,
		default: 10,
	})
	@ApiSuccessResponse({
		description: "Lista de categorias retornada com sucesso",
		dataType: CategoryDto,
	})
	@ApiUnauthorizedResponse({
		messageExample: "Token inválido ou expirado",
	})
	async findAll(@Query(PaginationParamsDto) pagination: PaginationParamsDto): Promise<ApiResponse<PaginatedData<CategoryDto>>> {
		const { items, total } = await this.categoriesService.findAllPaginated(pagination.page!, pagination.limit!, pagination.offset);
		return ApiResponse.paginated(items, pagination.page!, pagination.limit!, total, "Lista de categorias retornada com sucesso");
	}
}
