import { injectable, inject } from "inversify";
import { TYPES } from "../../../common/types";
import { UsersRepository } from "../../users/users.repository";
import { UserIdDto } from "@/modules/users/dto/id.dto";

/**
 * Use case responsável por remover o recovery_token do usuário (logout).
 * @param request - ID do usuário
 */
@injectable()
export class LogoutUserUseCase {
  constructor(
    @inject(TYPES.UsersRepository)
    private readonly usersRepository: UsersRepository
  ) {}

  async execute(request: UserIdDto): Promise<boolean> {
    await this.usersRepository.updateRecoveryToken(request.id, null);
    return true;
  }
}
