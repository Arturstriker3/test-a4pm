import { IsString, IsEmail, IsEnum, IsUUID } from "class-validator";
import { UserRole } from "../../users/entities/user.entity";

export class LoginResponseDto {
  @IsString()
  token!: string;

  @IsUUID()
  userId!: string;

  @IsString()
  nome!: string;

  @IsEmail()
  email!: string;

  @IsEnum(UserRole)
  role!: UserRole;

  constructor(data: {
    token: string;
    userId: string;
    nome: string;
    email: string;
    role: UserRole;
  }) {
    this.token = data.token;
    this.userId = data.userId;
    this.nome = data.nome;
    this.email = data.email;
    this.role = data.role;
  }
}
