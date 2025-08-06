import { injectable, inject } from "inversify";
import { TYPES } from "../../common/types";
import { RecipesService } from "./recipes.service";
import { CreateRecipeDto, CreateRecipeResponseDto, UpdateRecipeDto, UpdateRecipeResponseDto } from "./dto";
import { Controller, Post, Patch, Body, Param } from "../../common/decorators";
import { ApiResponse } from "../../common/responses";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { CurrentUserFull } from "../../common/decorators/current-user-full.decorator";
import { RouteAccess, RouteAccessType } from "../auth/decorators/access.decorators";
import {
  HandleClassExceptions,
  ApiOperation,
  ApiBody,
  ApiCreatedResponse,
  ApiSuccessResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from "../../common/decorators";
import { JwtPayload } from "../../common/middlewares/auth.middleware";

@injectable()
@Controller("/recipes")
@HandleClassExceptions
export class RecipesController {
  constructor(@inject(TYPES.RecipesService) private readonly recipesService: RecipesService) {}

  @Post()
  @RouteAccess(RouteAccessType.AUTHENTICATED)
  @ApiOperation({
    summary: "Criar nova receita",
    description: "Cria uma nova receita no sistema para o usuário autenticado.",
  })
  @ApiBody({
    type: CreateRecipeDto,
    description: "Dados para criação da receita",
  })
  @ApiCreatedResponse({
    description: "Receita criada com sucesso",
    dataType: CreateRecipeResponseDto,
  })
  @ApiBadRequestResponse({
    messageExample: "Nome da receita é obrigatório",
  })
  @ApiUnauthorizedResponse({
    messageExample: "Token de acesso inválido",
  })
  async createRecipe(
    @Body(CreateRecipeDto) createRecipeDto: CreateRecipeDto,
    @CurrentUser() userId: string
  ): Promise<ApiResponse<CreateRecipeResponseDto>> {
    const response = await this.recipesService.createRecipe(createRecipeDto, userId);
    return ApiResponse.created(response, "Receita criada com sucesso");
  }

  @Patch("/:id")
  @RouteAccess(RouteAccessType.AUTHENTICATED)
  @ApiOperation({
    summary: "Atualizar receita",
    description:
      "Atualiza uma receita existente. Apenas o proprietário da receita ou administradores podem fazer alterações.",
  })
  @ApiBody({
    type: UpdateRecipeDto,
    description: "Dados para atualização da receita (todos os campos são opcionais)",
  })
  @ApiSuccessResponse({
    description: "Receita atualizada com sucesso",
    dataType: UpdateRecipeResponseDto,
  })
  @ApiBadRequestResponse({
    messageExample: "ID da categoria deve ser um UUID válido",
  })
  @ApiUnauthorizedResponse({
    messageExample: "Token de acesso inválido",
  })
  @ApiForbiddenResponse({
    messageExample: "Você só pode editar suas próprias receitas",
  })
  @ApiNotFoundResponse({
    messageExample: "Receita não encontrada",
  })
  async updateRecipe(
    @Param("id") recipeId: string,
    @Body(UpdateRecipeDto) updateRecipeDto: UpdateRecipeDto,
    @CurrentUserFull() user: JwtPayload
  ): Promise<ApiResponse<UpdateRecipeResponseDto>> {
    const response = await this.recipesService.updateRecipe(recipeId, updateRecipeDto, user.userId, user.role as any);
    return ApiResponse.success(response, "Receita atualizada com sucesso");
  }
}
