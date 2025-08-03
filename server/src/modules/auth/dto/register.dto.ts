import { IsString, IsEmail, MinLength } from "class-validator";
import { SchemaProperty, SchemaClass } from "../../../common/decorators";

@SchemaClass({
  description: "Dados para registro de novo usuário no sistema",
})
export class RegisterDto {
  @IsString()
  @MinLength(2, { message: "Nome deve ter pelo menos 2 caracteres" })
  @SchemaProperty({
    description: "Nome completo do usuário",
    example: "João Silva",
    minLength: 2,
  })
  nome!: string;

  @IsEmail({}, { message: "Login deve ser um email válido" })
  @SchemaProperty({
    description: "Email do usuário (será usado como login)",
    format: "email",
    example: "joao@example.com",
  })
  login!: string;

  @IsString()
  @MinLength(6, { message: "Senha deve ter pelo menos 6 caracteres" })
  @SchemaProperty({
    description: "Senha do usuário (mínimo 6 caracteres)",
    minLength: 6,
    example: "123456",
  })
  senha!: string;
}
