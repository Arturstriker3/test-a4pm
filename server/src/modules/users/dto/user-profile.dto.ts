import { IsString, IsEmail, IsEnum, IsUUID, IsDate } from "class-validator";
import { Type } from "class-transformer";
import { UserRole } from "../entities/user.entity";
import { SchemaProperty, SchemaClass } from "../../../common/decorators";

@SchemaClass({
  description: "Dados do perfil do usuário autenticado",
})
export class UserProfileDto {
  @IsUUID()
  @SchemaProperty({
    description: "ID único do usuário",
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
    example: "joao.silva@email.com",
  })
  email!: string;

  @IsEnum(UserRole)
  @SchemaProperty({
    description: "Nível de acesso do usuário",
    example: UserRole.DEFAULT,
  })
  role!: UserRole;

  @IsDate()
  @Type(() => Date)
  @SchemaProperty({
    description: "Data de criação da conta",
    format: "date-time",
    example: "2024-01-15T10:30:00.000Z",
  })
  criado_em!: Date;

  @IsDate()
  @Type(() => Date)
  @SchemaProperty({
    description: "Data da última alteração",
    format: "date-time",
    example: "2024-01-15T10:30:00.000Z",
  })
  alterado_em!: Date;

  constructor(data: { id: string; nome: string; email: string; role: UserRole; criado_em: Date; alterado_em: Date }) {
    Object.assign(this, data);
  }
}
