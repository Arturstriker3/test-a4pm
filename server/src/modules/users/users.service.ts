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
}
