import { injectable, inject } from "inversify";
import { TYPES } from "../../common/types";
import { UsersService } from "./users.service";
import { Controller, Get, CurrentUser, Query } from "../../common/decorators";
import { AccessTo, RouteAccess, RouteAccessType } from "../auth/decorators/access.decorators";
import { ApiResponse, PaginatedData } from "../../common/responses";
import { PaginationParamsDto } from "../../common/dto";
import { HandleClassExceptions, ApiOperation, ApiSuccessResponse, ApiUnauthorizedResponse, ApiQuery } from "../../common/decorators";
import { UserProfileDto } from "./dto/user-profile.dto";
import { UserRole } from "./entities/user.entity";

@injectable()
@Controller("/users")
@HandleClassExceptions
export class UsersController {
	constructor(@inject(TYPES.UsersService) private readonly usersService: UsersService) {}

	@Get()
	@RouteAccess(RouteAccessType.AUTHENTICATED)
	@AccessTo(UserRole.ADMIN)
	@ApiOperation({
		summary: "Listar usuários com paginação acessível apenas para ADMIN",
		description: "Retorna uma lista paginada de usuários.",
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
		description: "Lista de usuários retornada com sucesso",
		dataType: UserProfileDto,
	})
	@ApiUnauthorizedResponse({
		messageExample: "Token inválido ou expirado",
	})
	async findAll(@Query(PaginationParamsDto) pagination: PaginationParamsDto): Promise<ApiResponse<PaginatedData<UserProfileDto>>> {
		const { items, total } = await this.usersService.findAllPaginated(pagination.page!, pagination.limit!, pagination.offset);
		return ApiResponse.paginated(items, pagination.page!, pagination.limit!, total, "Lista de usuários retornada com sucesso");
	}

	@Get("/me")
	@RouteAccess(RouteAccessType.AUTHENTICATED)
	@ApiOperation({
		summary: "Obter informações do usuário autenticado",
		description: "Retorna os dados do usuário autenticado baseado no token JWT.",
	})
	@ApiSuccessResponse({
		description: "Dados do usuário autenticado retornados com sucesso",
		dataType: UserProfileDto,
	})
	@ApiUnauthorizedResponse({
		messageExample: "Token inválido ou expirado",
	})
	async getMe(@CurrentUser() userId: string): Promise<ApiResponse<UserProfileDto>> {
		const response = await this.usersService.getUserById(userId);
		return ApiResponse.success(response, "Dados do usuário autenticado retornados com sucesso");
	}
}
