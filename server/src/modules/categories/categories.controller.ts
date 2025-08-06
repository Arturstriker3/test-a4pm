import { injectable, inject } from "inversify";
import { TYPES } from "../../common/types";
import { CategoriesService } from "./categories.service";
import { Controller, Get, Post, Put, Delete } from "../../common/decorators";
import { RouteAccess, AccessTo, RouteAccessType } from "../auth/decorators/access.decorators";
import { UserRole } from "../users/entities/user.entity";
import { ApiResponse } from "../../common/responses";
import { CreateCategoryDto, UpdateCategoryDto } from "./dto/category.dto";

@injectable()
@Controller("/categories")
export class CategoriesController {
  constructor(
    @inject(TYPES.CategoriesService)
    private readonly categoriesService: CategoriesService
  ) {}

  @Get("/")
  @RouteAccess(RouteAccessType.PUBLIC)
  async findAll(): Promise<ApiResponse<any[]>> {
    // TODO: Implementar busca de todas as categorias
    return ApiResponse.success([], "Categorias listadas com sucesso");
  }

  @Get("/:id")
  @RouteAccess(RouteAccessType.PUBLIC)
  async findById(params: { id: string }): Promise<ApiResponse<any>> {
    // TODO: Implementar busca por ID
    return ApiResponse.success({ id: params.id, nome: "Categoria" }, "Categoria encontrada");
  }

  @Post("/")
  @RouteAccess(RouteAccessType.AUTHENTICATED)
  @AccessTo(UserRole.ADMIN)
  async create(categoryDto: CreateCategoryDto): Promise<ApiResponse<any>> {
    // TODO: Implementar criação de categoria
    return ApiResponse.created(categoryDto, "Categoria criada com sucesso");
  }

  @Put("/:id")
  @RouteAccess(RouteAccessType.AUTHENTICATED)
  @AccessTo(UserRole.ADMIN)
  async update(params: { id: string }, categoryDto: UpdateCategoryDto): Promise<ApiResponse<any>> {
    // TODO: Implementar atualização de categoria
    return ApiResponse.success({ ...categoryDto, id: params.id }, "Categoria atualizada com sucesso");
  }

  @Delete("/:id")
  @RouteAccess(RouteAccessType.AUTHENTICATED)
  @AccessTo(UserRole.ADMIN)
  async delete(params: { id: string }): Promise<ApiResponse<void>> {
    // TODO: Implementar exclusão de categoria
    return ApiResponse.success(undefined, "Categoria excluída com sucesso");
  }
}
