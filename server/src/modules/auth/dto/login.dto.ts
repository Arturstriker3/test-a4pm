import { IsString, IsNotEmpty, IsEmail } from "class-validator";
import { SchemaProperty, SchemaClass } from "../../../common/decorators";

@SchemaClass({
  description: "Credenciais para autenticação do usuário",
})
export class LoginDto {
  @IsEmail({}, { message: "Login deve ser um email válido" })
  @SchemaProperty({
    description: "Email do usuário",
    format: "email",
    example: "joao@example.com",
  })
  login!: string;

  @IsString()
  @IsNotEmpty({ message: "Senha é obrigatória" })
  @SchemaProperty({
    description: "Senha do usuário",
    example: "123456",
  })
  senha!: string;
}
