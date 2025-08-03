import { IsString, IsEmail, IsEnum, IsUUID, IsDate } from "class-validator";
import { Type } from "class-transformer";
import { UserRole } from "../../users/entities/user.entity";

export class RegisterResponseDto {
  @IsUUID()
  id!: string;

  @IsString()
  nome!: string;

  @IsEmail()
  login!: string;

  @IsEnum(UserRole)
  nivel_acesso!: UserRole;

  @IsDate()
  @Type(() => Date)
  criado_em!: Date;

  @IsDate()
  @Type(() => Date)
  alterado_em!: Date;

  constructor(user: any) {
    this.id = user.id;
    this.nome = user.nome;
    this.login = user.login;
    this.nivel_acesso = user.nivel_acesso;
    this.criado_em = user.criado_em;
    this.alterado_em = user.alterado_em;
  }
}
