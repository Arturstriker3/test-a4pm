import { injectable, inject } from "inversify";
import { TYPES } from "../../common/types";
import { AuthService } from "./auth.service";
import { RegisterDto, RegisterResponseDto, LoginDto, LoginResponseDto, RefreshTokenDto, TokenResponseDto } from "./dto";
import { RouteAccess, AccessTo, RouteAccessType } from "./decorators/access.decorators";
import { Controller, Post, Param } from "../../common/decorators";
import { ApiResponse } from "../../common/responses";
import { HandleClassExceptions, ApiOperation, ApiBody, ApiCreatedResponse, ApiSuccessResponse, ApiBadRequestResponse, ApiUnauthorizedResponse } from "../../common/decorators";
import { UserIdDto } from "../users/dto/id.dto";

@injectable()
@Controller("/auth")
@HandleClassExceptions
export class AuthController {
	constructor(@inject(TYPES.AuthService) private readonly authService: AuthService) {}

	@Post("/register")
	@RouteAccess(RouteAccessType.PUBLIC)
	@ApiOperation({
		summary: "Registrar novo usuário",
		description: "Cria uma nova conta de usuário no sistema.",
	})
	@ApiBody({
		type: RegisterDto,
		description: "Dados para registro de usuário",
	})
	@ApiCreatedResponse({
		description: "Usuário registrado com sucesso",
		dataType: RegisterResponseDto,
	})
	@ApiBadRequestResponse({
		messageExample: "Email já está em uso",
	})
	async register(registerDto: RegisterDto): Promise<ApiResponse<RegisterResponseDto>> {
		const response = await this.authService.register(registerDto);
		return ApiResponse.created(response, "Usuário criado com sucesso");
	}

	@Post("/login")
	@RouteAccess(RouteAccessType.PUBLIC)
	@ApiOperation({
		summary: "Fazer login",
		description: "Autentica um usuário e retorna um token JWT para acesso às rotas protegidas.",
	})
	@ApiBody({
		type: LoginDto,
		description: "Credenciais de login",
	})
	@ApiSuccessResponse({
		description: "Login realizado com sucesso",
		dataType: LoginResponseDto,
	})
	@ApiUnauthorizedResponse({
		messageExample: "Credenciais inválidas",
	})
	async login(loginDto: LoginDto): Promise<ApiResponse<LoginResponseDto>> {
		const response = await this.authService.login(loginDto);
		return ApiResponse.success(response, "Login realizado com sucesso");
	}

	@Post("/refresh")
	@RouteAccess(RouteAccessType.PUBLIC)
	@ApiOperation({
		summary: "Troca de token",
		description: "Recebe um refresh token válido e retorna um novo access token e refresh token.",
	})
	@ApiBody({
		type: RefreshTokenDto,
		description: "Payload contendo o refresh token.",
	})
	@ApiSuccessResponse({
		description: "Tokens trocados com sucesso",
		dataType: TokenResponseDto,
	})
	@ApiUnauthorizedResponse({
		messageExample: "Refresh token inválido ou expirado",
	})
	async refresh(refreshTokenDto: RefreshTokenDto): Promise<ApiResponse<TokenResponseDto>> {
		const response = await this.authService.refreshToken(refreshTokenDto);
		return ApiResponse.success(response, "Tokens atualizados com sucesso");
	}

	@Post("/logout/:id")
	@RouteAccess(RouteAccessType.AUTHENTICATED)
	@ApiOperation({
		summary: "Logout do usuário",
		description: "Remove o recovery token do usuário logado.",
	})
	@ApiSuccessResponse({
		description: "Logout realizado com sucesso",
		dataType: null,
	})
	async logout(@Param("id", UserIdDto) id: string): Promise<ApiResponse<null>> {
		const userIdDto: UserIdDto = { id: id };
		await this.authService.logout(userIdDto);
		return ApiResponse.success(null, "Logout realizado com sucesso");
	}
}
