import { IsString, IsEmail, MinLength } from "class-validator";

export class RegisterDto {
  @IsString()
  @MinLength(2, { message: "Nome deve ter pelo menos 2 caracteres" })
  nome!: string;

  @IsEmail({}, { message: "Login deve ser um email válido" })
  login!: string;

  @IsString()
  @MinLength(6, { message: "Senha deve ter pelo menos 6 caracteres" })
  senha!: string;
}
