import { IsString, IsEmail, IsEnum, IsUUID } from "class-validator";
import { UserRole } from "../../users/entities/user.entity";
import { SchemaProperty, SchemaClass } from "../../../common/decorators";

@SchemaClass({
  description: "Dados de resposta do login bem-sucedido",
})
export class LoginResponseDto {
  @IsString()
  @SchemaProperty({
    description: "Token JWT para autenticação",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  token!: string;

  @IsUUID()
  @SchemaProperty({
    description: "ID único do usuário",
    format: "uuid",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  userId!: string;

  @IsString()
  @SchemaProperty({
    description: "Nome completo do usuário",
    example: "João Silva",
  })
  nome!: string;

  @IsEmail()
  @SchemaProperty({
    description: "Email do usuário",
    format: "email",
    example: "joao@example.com",
  })
  email!: string;

  @IsEnum(UserRole)
  @SchemaProperty({
    description: "Nível de acesso do usuário",
    enum: Object.values(UserRole),
    example: "DEFAULT",
  })
  role!: UserRole;

  constructor(data: { token: string; userId: string; nome: string; email: string; role: UserRole }) {
    this.token = data.token;
    this.userId = data.userId;
    this.nome = data.nome;
    this.email = data.email;
    this.role = data.role;
  }
}
