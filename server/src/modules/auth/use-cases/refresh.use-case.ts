import { injectable, inject } from "inversify";
import { TYPES } from "../../../common/types";
import { UsersRepository } from "../../users/users.repository";
import { UserBusinessRules } from "../../users/rules/user.rules";
import { RefreshTokenDto } from "../dto";
import {
  UnauthorizedException,
  NotFoundException,
} from "../../../common/exceptions/app-exceptions";
import { AuthMiddleware, JwtPayload } from "../../../common/middlewares";
import { TokenResponseDto } from "../dto";
import { User } from "../../users/entities/user.entity";

/**
 * Use case responsável por renovar tokens de acesso usando refresh token.
 * Valida o refresh token, busca o usuário e gera novos tokens de acesso.
 *
 * Implementa proteção contra reutilização de refresh tokens:
 * - Verifica se o refresh token usado é o mesmo armazenado no banco
 * - Invalida o refresh token usado após gerar novos tokens
 * - Previne ataques de replay com tokens antigos
 *
 * @param request - Refresh token para renovação (RefreshTokenDto)
 * @returns Promise<TokenResponseDto> - Novos tokens de acesso e refresh
 * @throws UnauthorizedException - Quando o refresh token é inválido, expirado ou já foi usado
 * @throws UnauthorizedException - Quando o refresh token não corresponde ao armazenado no banco
 * @throws UnauthorizedException - Quando o usuário não é encontrado para o token (UserBusinessRules.validateUserForRefresh)
 */
@injectable()
export class RefreshUserUseCase {
  constructor(
    @inject(TYPES.UsersRepository)
    private readonly usersRepository: UsersRepository
  ) {}

  async execute(request: RefreshTokenDto): Promise<TokenResponseDto> {
    const payload = this.verifyRefreshToken(request.refreshToken);
    const user = await this.getUserByPayload(payload);

    UserBusinessRules.validateUserForRefresh(user);

    await this.validateStoredRefreshToken(user, request.refreshToken);

    const { token, refreshToken } = await this.generateTokens(user);
    return new TokenResponseDto({ token, refreshToken });
  }

  private verifyRefreshToken(token: string): JwtPayload {
    const payload = AuthMiddleware.verifyToken(token);
    if (!payload || !payload.userId) {
      throw new UnauthorizedException("Refresh token inválido ou expirado");
    }
    return payload;
  }

  private async getUserByPayload(payload: JwtPayload): Promise<User> {
    const user = await this.usersRepository.findById(payload.userId);
    if (!user) {
      throw new NotFoundException("Usuário não encontrado");
    }
    return user;
  }

  private async validateStoredRefreshToken(
    user: User,
    providedRefreshToken: string
  ): Promise<void> {
    if (!user.recovery_token) {
      throw new UnauthorizedException(
        "Refresh token inválido ou não corresponde ao token armazenado"
      );
    }

    if (user.recovery_token !== providedRefreshToken) {
      throw new UnauthorizedException(
        "Refresh token inválido ou não corresponde ao token armazenado"
      );
    }
  }

  private async generateTokens(
    user: User
  ): Promise<{ token: string; refreshToken: string }> {
    const token = AuthMiddleware.generateToken({
      userId: user.id,
      email: user.login,
      role: user.nivel_acesso,
    });

    const refreshToken = AuthMiddleware.generateRecoveryToken({
      userId: user.id,
      email: user.login,
    });

    await this.usersRepository.updateRecoveryToken(user.id, refreshToken);

    return { token, refreshToken };
  }
}
