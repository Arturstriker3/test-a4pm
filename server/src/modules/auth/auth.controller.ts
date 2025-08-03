import { injectable, inject } from "inversify";
import { TYPES } from "../../common/types";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/auth.dto";
import {
  RouteAccess,
  AccessTo,
  RouteAccessType,
} from "./decorators/access.decorators";
import { UserRole } from "../users/entities/user.entity";
import { ApiResponse } from "../../common/responses";
import { HandleClassExceptions } from "../../common/decorators";

@injectable()
@HandleClassExceptions
export class AuthController {
  constructor(
    @inject(TYPES.AuthService) private readonly authService: AuthService
  ) {}

  @RouteAccess(RouteAccessType.PUBLIC)
  async register(registerDto: RegisterDto): Promise<ApiResponse> {
    const user = await this.authService.register(registerDto);
    return ApiResponse.created(user, "Usuário criado com sucesso");
  }

  // Exemplo de rota que só ADMIN pode acessar
  @RouteAccess(RouteAccessType.AUTHENTICATED)
  @AccessTo(UserRole.ADMIN)
  async adminOnly(): Promise<ApiResponse> {
    return ApiResponse.success(
      null,
      "Acesso permitido apenas para administradores"
    );
  }

  // Exemplo de rota que qualquer usuário autenticado pode acessar
  @RouteAccess(RouteAccessType.AUTHENTICATED)
  async authenticatedOnly(): Promise<ApiResponse> {
    return ApiResponse.success(
      null,
      "Acesso permitido para usuários autenticados"
    );
  }
}
