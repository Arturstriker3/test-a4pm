import { injectable, inject } from "inversify";
import { TYPES } from "../../common/types";
import { UsersRepository } from "./users.repository";

@injectable()
export class UsersService {
  constructor(
    @inject(TYPES.UsersRepository)
    private readonly usersRepository: UsersRepository
  ) {}

  // TODO: Implement methods
}
