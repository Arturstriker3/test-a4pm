import { injectable, inject } from "inversify";
import { TYPES } from "../../../common/types";
import { UsersRepository } from "../users.repository";
import { UserBusinessRules } from "../rules/user.rules";
import { UserProfileDto } from "../dto/user-profile.dto";

/**
 * Use case responsável por retornar o usuário pelo ID.
 * Aplica business rules e retorna os dados do usuário.
 *
 * @param userId - ID do usuário
 * @returns Promise<UserProfileDto> - Dados do usuário
 * @throws UnauthorizedException - Quando o usuário não existe
 */
@injectable()
export class GetUserByIdUseCase {
  constructor(
    @inject(TYPES.UsersRepository)
    private readonly usersRepository: UsersRepository
  ) {}

  async execute(userId: string): Promise<UserProfileDto> {
    const user = await this.usersRepository.findById(userId);
    UserBusinessRules.validateUserForGetUserData(user);

    const validUser = user!;

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
