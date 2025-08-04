import { IsString } from "class-validator";
import { SchemaProperty, SchemaClass } from "../../../common/decorators";

@SchemaClass({
  description: "Payload contendo apenas o refresh token para troca de tokens.",
})
export class RefreshTokenDto {
  @IsString()
  @SchemaProperty({
    description: "Refresh token JWT válido",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  refreshToken!: string;
} // @args { "refreshToken": "string" }
export interface RefreshTokenDto {
  refreshToken: string;
}
