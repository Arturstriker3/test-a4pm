import { injectable, inject } from "inversify";
import { TYPES } from "../../common/types";
import { RegisterDto, RegisterResponseDto } from "./dto";
import { RegisterUserUseCase } from "./use-cases/register-user.use-case";

@injectable()
export class AuthService {
  constructor(
    @inject(TYPES.RegisterUserUseCase)
    private readonly registerUserUseCase: RegisterUserUseCase
  ) {}

  async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    return await this.registerUserUseCase.execute(registerDto);
  }
}
