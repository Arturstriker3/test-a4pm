import {
  IsString,
  IsEmail,
  IsOptional,
  IsDate,
  MinLength,
  IsUUID,
  IsEnum,
} from "class-validator";
import { Type } from "class-transformer";

export enum UserRole {
  ADMIN = "ADMIN",
  DEFAULT = "DEFAULT",
}

export class User {
  @IsUUID()
  id!: string;

  @IsString()
  @MinLength(2, { message: "Nome deve ter pelo menos 2 caracteres" })
  nome!: string;

  @IsEmail({}, { message: "Login deve ser um email válido" })
  login!: string;

  @IsString()
  @MinLength(6, { message: "Senha deve ter pelo menos 6 caracteres" })
  senha!: string;

  @IsEnum(UserRole, { message: "Nível de acesso deve ser ADMIN ou DEFAULT" })
  nivel_acesso: UserRole = UserRole.DEFAULT;

  @IsOptional()
  @IsString()
  recovery_token?: string | null;

  @IsDate()
  @Type(() => Date)
  criado_em!: Date;

  @IsDate()
  @Type(() => Date)
  alterado_em!: Date;
}
