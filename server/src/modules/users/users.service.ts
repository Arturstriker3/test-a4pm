import { injectable, inject } from "inversify";
import { TYPES } from "../../common/types";
import { UsersRepository } from "./users.repository";
import { GetUserByIdUseCase } from "./use-cases/get-user-by-id.use-case";
import { UserProfileDto } from "./dto/user-profile.dto";
import { AuthMiddleware } from "../../common/middlewares";
import { UserBusinessRules } from "./rules/user.rules";

@injectable()
export class UsersService {
  constructor(
    @inject(TYPES.UsersRepository)
    private readonly usersRepository: UsersRepository,
    @inject(TYPES.GetUserByIdUseCase)
    private readonly getUserByIdUseCase: GetUserByIdUseCase
  ) {}

  async getUserById(userId: string): Promise<UserProfileDto> {
    return await this.getUserByIdUseCase.execute(userId);
  }

  async getUserByToken(token: string): Promise<UserProfileDto> {
    // Verifica e decodifica o token
    const tokenPayload = AuthMiddleware.verifyToken(token);
    if (!tokenPayload) {
      throw new Error("Token inválido ou expirado");
    }

    // Busca o usuário pelo ID do token
    const user = await this.usersRepository.findById(tokenPayload.userId);

    // Valida se o usuário existe
    UserBusinessRules.validateUserForLogin(user);

    const validUser = user!;

    // Retorna os dados do usuário sem informações sensíveis
    return new UserProfileDto({
      id: validUser.id,
      nome: validUser.nome,
      email: validUser.login,
      role: validUser.nivel_acesso,
      criado_em: validUser.criado_em,
      alterado_em: validUser.alterado_em,
    });
  }
}
