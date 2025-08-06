import { injectable, inject } from "inversify";
import { TYPES } from "../../common/types";
import { RecipesService } from "./recipes.service";
import { CreateRecipeDto, CreateRecipeResponseDto } from "./dto";
import { Controller, Post, Body } from "../../common/decorators";
import { ApiResponse } from "../../common/responses";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { RouteAccess, RouteAccessType } from "../auth/decorators/access.decorators";
import {
  HandleClassExceptions,
  ApiOperation,
  ApiBody,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from "../../common/decorators";

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
}
