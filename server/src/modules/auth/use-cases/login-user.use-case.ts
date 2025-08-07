import { injectable, inject } from "inversify";
import { TYPES } from "../../../common/types";
import { UsersRepository } from "../../users/users.repository";
import { UserBusinessRules } from "../../users/rules/user.rules";
import { LoginDto, LoginResponseDto } from "../dto";
import { AuthMiddleware } from "../../../common/middlewares";
import * as bcrypt from "bcrypt";

/**
 * Use case responsável por autenticar usuários no sistema.
 * Valida credenciais, aplica business rules e gera token JWT de acesso.
 *
 * @param request - Credenciais do usuário (LoginDto)
 * @returns Promise<LoginResponseDto> - Token e dados do usuário autenticado
 * @throws UnauthorizedException - Quando o usuário não existe (UserBusinessRules.validateUserForLogin)
 * @throws UnauthorizedException - Quando a senha está incorreta (UserBusinessRules.validatePasswordMatch)
 * @throws Error - Quando JWT_SECRET não está configurado nas variáveis de ambiente
 */
@injectable()
export class LoginUserUseCase {
	constructor(
		@inject(TYPES.UsersRepository)
		private readonly usersRepository: UsersRepository
	) {}

	async execute(request: LoginDto): Promise<LoginResponseDto> {
		const user = await this.usersRepository.findByLogin(request.login);

		UserBusinessRules.validateUserForLogin(user);

		const validUser = user!;

		const isPasswordValid = await this.verifyPassword(request.senha, validUser.senha);

		UserBusinessRules.validatePasswordMatch(isPasswordValid);

		const token = AuthMiddleware.generateToken({
			userId: validUser.id,
			email: validUser.login,
			role: validUser.nivel_acesso,
		});

		const recoveryToken = AuthMiddleware.generateRecoveryToken({
			userId: validUser.id,
			email: validUser.login,
		});

		await this.usersRepository.updateRecoveryToken(validUser.id, recoveryToken);

		return new LoginResponseDto({
			token,
			userId: validUser.id,
			nome: validUser.nome,
			email: validUser.login,
			role: validUser.nivel_acesso,
		});
	}

	private async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
		return bcrypt.compare(plainPassword, hashedPassword);
	}
}
