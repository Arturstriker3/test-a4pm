import { injectable, inject } from "inversify";
import { TYPES } from "../../common/types";
import { UsersService } from "./users.service";
import { Controller, Get, CurrentUser } from "../../common/decorators";
import { RouteAccess, RouteAccessType } from "../auth/decorators/access.decorators";
import { ApiResponse } from "../../common/responses";
import {
  HandleClassExceptions,
  ApiOperation,
  ApiSuccessResponse,
  ApiUnauthorizedResponse,
} from "../../common/decorators";
import { UserProfileDto } from "./dto/user-profile.dto";
import { JwtPayload } from "../../common/middlewares";

@injectable()
@Controller("/users")
@HandleClassExceptions
export class UsersController {
  constructor(@inject(TYPES.UsersService) private readonly usersService: UsersService) {}

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
  async getMe(@CurrentUser() user: JwtPayload): Promise<ApiResponse<UserProfileDto>> {
    const userId = user.userId;
    const response = await this.usersService.getUserById(userId);
    return ApiResponse.success(response, "Dados do usuário autenticado retornados com sucesso");
  }
}
