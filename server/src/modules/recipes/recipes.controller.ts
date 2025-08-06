import { injectable, inject } from "inversify";
import { TYPES } from "../../common/types";
import { RecipesService } from "./recipes.service";
import { Controller, Get, Post, Put, Delete } from "../../common/decorators";
import { RouteAccess, AccessTo, RouteAccessType } from "../auth/decorators/access.decorators";
import { UserRole } from "../users/entities/user.entity";
import { ApiResponse } from "../../common/responses";
import { CreateRecipeDto, UpdateRecipeDto } from "./dto/recipe.dto";

@injectable()
@Controller("/recipes")
export class RecipesController {
  constructor(
    @inject(TYPES.RecipesService)
    private readonly recipesService: RecipesService
  ) {}

  @Get("/")
  @RouteAccess(RouteAccessType.PUBLIC)
  async findAll(): Promise<ApiResponse<any[]>> {
    // TODO: Implementar busca de todas as receitas
    return ApiResponse.success([], "Receitas listadas com sucesso");
  }

  @Get("/:id")
  @RouteAccess(RouteAccessType.PUBLIC)
  async findById(params: { id: string }): Promise<ApiResponse<any>> {
    // TODO: Implementar busca por ID
    return ApiResponse.success({ id: params.id, nome: "Receita" }, "Receita encontrada");
  }

  @Post("/")
  @RouteAccess(RouteAccessType.AUTHENTICATED)
  async create(recipeDto: CreateRecipeDto): Promise<ApiResponse<any>> {
    // TODO: Implementar criação de receita
    return ApiResponse.created(recipeDto, "Receita criada com sucesso");
  }

  @Put("/:id")
  @RouteAccess(RouteAccessType.AUTHENTICATED)
  async update(params: { id: string }, recipeDto: UpdateRecipeDto): Promise<ApiResponse<any>> {
    // TODO: Implementar atualização de receita
    return ApiResponse.success({ ...recipeDto, id: params.id }, "Receita atualizada com sucesso");
  }

  @Delete("/:id")
  @RouteAccess(RouteAccessType.AUTHENTICATED)
  @AccessTo(UserRole.ADMIN)
  async delete(params: { id: string }): Promise<ApiResponse<void>> {
    // TODO: Implementar exclusão de receita
    return ApiResponse.success(undefined, "Receita excluída com sucesso");
  }
}
