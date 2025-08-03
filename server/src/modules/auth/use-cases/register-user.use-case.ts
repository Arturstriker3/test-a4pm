import { injectable, inject } from "inversify";
import { TYPES } from "../../../common/types";
import { UsersRepository } from "../../users/users.repository";
import { User, UserRole } from "../../users/entities/user.entity";
import { UserBusinessRules } from "../../users/rules/user.rules";
import { RegisterDto, RegisterResponseDto } from "../dto";
import * as bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

/**
 * Use case responsável por registrar novos usuários no sistema.
 * Valida regras de negócio, cria hash da senha e persiste no banco.
 *
 * @param request - Dados do usuário para registro (RegisterDto)
 * @returns Promise<RegisterResponseDto> - Dados do usuário criado sem informações sensíveis
 * @throws ConflictException - Quando já existe um usuário com o email informado (UserBusinessRules.validateUniqueEmail)
 * @throws ValidationError - Quando os dados do DTO são inválidos (class-validator)
 */
@injectable()
export class RegisterUserUseCase {
  constructor(
    @inject(TYPES.UsersRepository)
    private readonly usersRepository: UsersRepository
  ) {}

  async execute(request: RegisterDto): Promise<RegisterResponseDto> {
    await this.validateBusinessRules(request);
    const hashedPassword = await this.hashPassword(request.senha);
    const user = this.createUserEntity(request, hashedPassword);
    const savedUser = await this.usersRepository.save(user);

    return new RegisterResponseDto(savedUser);
  }

  private async validateBusinessRules(request: RegisterDto): Promise<void> {
    const existingUser = await this.usersRepository.findByLogin(request.login);
    UserBusinessRules.validateUniqueEmail(existingUser);
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  private createUserEntity(request: RegisterDto, hashedPassword: string): User {
    const now = new Date();

    return {
      id: uuidv4(),
      nome: request.nome,
      login: request.login,
      senha: hashedPassword,
      nivel_acesso: UserRole.DEFAULT,
      recovery_token: null,
      criado_em: now,
      alterado_em: now,
    };
  }
}
