import { injectable, inject } from "inversify";
import { TYPES } from "../../common/types";
import { AuthService } from "./auth.service";

@injectable()
export class AuthController {
  constructor(
    @inject(TYPES.AuthService) private readonly authService: AuthService
  ) {}

  // TODO: Implement authentication endpoints
}
