import { injectable, inject } from "inversify";
import { TYPES } from "../../common/types";
import { UsersService } from "./users.service";

@injectable()
export class UsersController {
  constructor(
    @inject(TYPES.UsersService) private readonly usersService: UsersService
  ) {}

  // TODO: Implement REST endpoints
}
