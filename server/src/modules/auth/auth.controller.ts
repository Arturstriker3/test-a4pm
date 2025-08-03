import { injectable, inject } from "inversify";
import { TYPES } from "../../common/types";
import { AuthService } from "./auth.service";
import {
  RegisterDto,
  RegisterResponseDto,
  LoginDto,
  LoginResponseDto,
} from "./dto";
import {
  RouteAccess,
  AccessTo,
  RouteAccessType,
} from "./decorators/access.decorators";
import { ApiResponse } from "../../common/responses";
import { HandleClassExceptions } from "../../common/decorators";

@injectable()
@HandleClassExceptions
export class AuthController {
  constructor(
    @inject(TYPES.AuthService) private readonly authService: AuthService
  ) {}

  @RouteAccess(RouteAccessType.PUBLIC)
  async register(
    registerDto: RegisterDto
  ): Promise<ApiResponse<RegisterResponseDto>> {
    const response = await this.authService.register(registerDto);
    return ApiResponse.created(response, "Usuário criado com sucesso");
  }

  @RouteAccess(RouteAccessType.PUBLIC)
  async login(loginDto: LoginDto): Promise<ApiResponse<LoginResponseDto>> {
    const response = await this.authService.login(loginDto);
    return ApiResponse.success(response, "Login realizado com sucesso");
  }
}
