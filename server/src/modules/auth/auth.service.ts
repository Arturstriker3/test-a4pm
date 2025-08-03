import { injectable, inject } from "inversify";
import { TYPES } from "../../common/types";
import { RegisterDto } from "./dto/auth.dto";
import { User } from "../users/entities/user.entity";
import { RegisterUserUseCase } from "./use-cases/register-user.use-case";

@injectable()
export class AuthService {
  constructor(
    @inject(TYPES.RegisterUserUseCase)
    private readonly registerUserUseCase: RegisterUserUseCase
  ) {}

  async register(registerDto: RegisterDto): Promise<Omit<User, "senha">> {
    const result = await this.registerUserUseCase.execute({
      nome: registerDto.nome,
      login: registerDto.login,
      senha: registerDto.senha,
      nivel_acesso: registerDto.nivel_acesso,
    });

    return result.user;
  }
}
