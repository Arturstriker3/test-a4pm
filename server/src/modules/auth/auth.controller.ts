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
import { Controller, Post } from "../../common/decorators";
import { ApiResponse } from "../../common/responses";
import {
  HandleClassExceptions,
  ApiOperation,
  ApiResponse as ApiResponseDoc,
  ApiBody,
} from "../../common/decorators";

@injectable()
@Controller("/auth")
@HandleClassExceptions
export class AuthController {
  constructor(
    @inject(TYPES.AuthService) private readonly authService: AuthService
  ) {}

  @Post("/register")
  @RouteAccess(RouteAccessType.PUBLIC)
  @ApiOperation({
    summary: "Registrar novo usuário",
    description:
      "Cria uma nova conta de usuário no sistema. Não requer autenticação.",
  })
  @ApiBody({
    type: RegisterDto,
    description: "Dados para registro de usuário",
  })
  @ApiResponseDoc({
    status: 201,
    description: "Usuário registrado com sucesso",
    type: RegisterResponseDto,
  })
  @ApiResponseDoc({
    status: 400,
    description: "Dados inválidos",
    schema: {
      type: "object",
      properties: {
        message: {
          type: "string",
        },
      },
    },
  })
  async register(
    registerDto: RegisterDto
  ): Promise<ApiResponse<RegisterResponseDto>> {
    const response = await this.authService.register(registerDto);
    return ApiResponse.created(response, "Usuário criado com sucesso");
  }

  @Post("/login")
  @RouteAccess(RouteAccessType.PUBLIC)
  @ApiOperation({
    summary: "Fazer login",
    description:
      "Autentica um usuário e retorna um token JWT para acesso às rotas protegidas.",
  })
  @ApiBody({
    type: LoginDto,
    description: "Credenciais de login",
  })
  @ApiResponseDoc({
    status: 200,
    description: "Login realizado com sucesso",
    type: LoginResponseDto,
  })
  @ApiResponseDoc({
    status: 401,
    description: "Credenciais inválidas",
    schema: {
      type: "object",
      properties: {
        message: {
          type: "string",
        },
      },
    },
  })
  async login(loginDto: LoginDto): Promise<ApiResponse<LoginResponseDto>> {
    const response = await this.authService.login(loginDto);
    return ApiResponse.success(response, "Login realizado com sucesso");
  }
}
