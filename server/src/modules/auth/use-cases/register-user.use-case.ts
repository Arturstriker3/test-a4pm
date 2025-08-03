import { injectable, inject } from "inversify";
import { TYPES } from "../../../common/types";
import { UsersRepository } from "../../users/users.repository";
import { User, UserRole } from "../../users/entities/user.entity";
import { UserBusinessRules } from "../../users/rules/user.rules";
import * as bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

export interface RegisterUserRequest {
  nome: string;
  login: string;
  senha: string;
  nivel_acesso?: UserRole;
}

export interface RegisterUserResponse {
  user: Omit<User, "senha">;
}

@injectable()
export class RegisterUserUseCase {
  constructor(
    @inject(TYPES.UsersRepository)
    private readonly usersRepository: UsersRepository
  ) {}

  async execute(request: RegisterUserRequest): Promise<RegisterUserResponse> {
    // Aplicar apenas as Business Rules específicas do domínio
    // As validações básicas (formato email, tamanho mínimo, etc.) são feitas pela entidade
    await this.validateBusinessRules(request);

    // Hash da senha
    const hashedPassword = await this.hashPassword(request.senha);

    // Criar entidade User (aqui as validações da entidade serão aplicadas)
    const user = this.createUserEntity(request, hashedPassword);

    // Persistir no repositório
    const savedUser = await this.usersRepository.save(user);

    // Retornar sem a senha
    const { senha, ...userWithoutPassword } = savedUser;

    return {
      user: userWithoutPassword,
    };
  }

  private async validateBusinessRules(
    request: RegisterUserRequest
  ): Promise<void> {
    // Apenas regras de negócio específicas que requerem consulta ao banco ou lógica complexa

    // Verificar unicidade do email (regra de domínio)
    const existingUser = await this.usersRepository.findByLogin(request.login);
    UserBusinessRules.validateUniqueEmail(existingUser);

    // Outras regras de negócio específicas podem ser adicionadas aqui
    // Ex: validar se o usuário atual pode criar admin, quotas, etc.
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  private createUserEntity(
    request: RegisterUserRequest,
    hashedPassword: string
  ): User {
    const now = new Date();

    return {
      id: uuidv4(),
      nome: request.nome,
      login: request.login,
      senha: hashedPassword,
      nivel_acesso: request.nivel_acesso || UserRole.DEFAULT,
      recovery_token: null,
      criado_em: now,
      alterado_em: now,
    };
  }
}
