import { injectable, inject } from "inversify";
import { TYPES } from "../../common/types";
import {
  RegisterDto,
  RegisterResponseDto,
  LoginDto,
  LoginResponseDto,
  TokenResponseDto,
  RefreshTokenDto,
} from "./dto";
import { RegisterUserUseCase } from "./use-cases/register-user.use-case";
import { LoginUserUseCase } from "./use-cases/login-user.use-case";
import { LogoutUserUseCase } from "./use-cases/logout-user.use-case";
import { UserIdDto } from "../users/dto/id.dto";
import { RefreshUserUseCase } from "./use-cases/refresh.use-case";


@injectable()
export class AuthService {
  constructor(
    @inject(TYPES.RegisterUserUseCase)
    private readonly registerUserUseCase: RegisterUserUseCase,
    @inject(TYPES.LoginUserUseCase)
    private readonly loginUserUseCase: LoginUserUseCase,
    @inject(TYPES.LogoutUserUseCase)
    private readonly logoutUserUseCase: LogoutUserUseCase,
    @inject(TYPES.RefreshUserUseCase)
    private readonly refreshUserUseCase: RefreshUserUseCase
  ) {}

  async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    return await this.registerUserUseCase.execute(registerDto);
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    return await this.loginUserUseCase.execute(loginDto);
  }

  async logout(userIdDto: UserIdDto): Promise<boolean> {
    await this.logoutUserUseCase.execute(userIdDto);
    return true;
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<TokenResponseDto> {
    return await this.refreshUserUseCase.execute(refreshTokenDto);
  }
}
