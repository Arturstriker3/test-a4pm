import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  IsOptional,
  IsEnum,
} from "class-validator";
import { UserRole } from "../../users/entities/user.entity";

export class RegisterDto {
  @IsString()
  @MinLength(2, { message: "Nome deve ter pelo menos 2 caracteres" })
  nome!: string;

  @IsEmail({}, { message: "Login deve ser um email válido" })
  login!: string;

  @IsString()
  @MinLength(6, { message: "Senha deve ter pelo menos 6 caracteres" })
  senha!: string;

  @IsOptional()
  @IsEnum(UserRole, { message: "Nível de acesso deve ser ADMIN ou DEFAULT" })
  nivel_acesso?: UserRole = UserRole.DEFAULT;
}

export class LoginDto {
  @IsEmail({}, { message: "Login deve ser um email válido" })
  login!: string;

  @IsString()
  @IsNotEmpty({ message: "Senha é obrigatória" })
  senha!: string;
}
