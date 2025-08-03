import { injectable, inject } from "inversify";
import { TYPES } from "../../common/types";
import {
  RegisterDto,
  RegisterResponseDto,
  LoginDto,
  LoginResponseDto,
} from "./dto";
import { RegisterUserUseCase } from "./use-cases/register-user.use-case";
import { LoginUserUseCase } from "./use-cases/login-user.use-case";

@injectable()
export class AuthService {
  constructor(
    @inject(TYPES.RegisterUserUseCase)
    private readonly registerUserUseCase: RegisterUserUseCase,
    @inject(TYPES.LoginUserUseCase)
    private readonly loginUserUseCase: LoginUserUseCase
  ) {}

  async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    return await this.registerUserUseCase.execute(registerDto);
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    return await this.loginUserUseCase.execute(loginDto);
  }
}
