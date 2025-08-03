import { IsString, IsNotEmpty, IsEmail } from "class-validator";

export class LoginDto {
  @IsEmail({}, { message: "Login deve ser um email válido" })
  login!: string;

  @IsString()
  @IsNotEmpty({ message: "Senha é obrigatória" })
  senha!: string;
}
