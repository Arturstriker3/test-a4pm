import { IsString, IsEmail, IsEnum, IsUUID, IsDate } from "class-validator";
import { Type } from "class-transformer";
import { UserRole } from "../../users/entities/user.entity";
import { SchemaProperty, SchemaClass } from "../../../common/decorators";

@SchemaClass({
  description: "Dados do usuário criado com sucesso",
})
export class RegisterResponseDto {
  @IsUUID()
  @SchemaProperty({
    description: "ID único do usuário criado",
    format: "uuid",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id!: string;

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
  login!: string;

  @IsEnum(UserRole)
  @SchemaProperty({
    description: "Nível de acesso do usuário",
    enum: Object.values(UserRole),
    example: "DEFAULT",
  })
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
