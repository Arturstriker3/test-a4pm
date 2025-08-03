import { injectable, inject } from "inversify";
import { TYPES } from "../../common/types";
import { UsersService } from "../users/users.service";

@injectable()
export class AuthService {
  constructor(
    @inject(TYPES.UsersService) private readonly usersService: UsersService
  ) {}

  // TODO: Implement authentication methods
}
