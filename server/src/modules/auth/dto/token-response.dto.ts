import { IsString } from "class-validator";
import { SchemaProperty, SchemaClass } from "../../../common/decorators";

@SchemaClass({
	description: "Resposta contendo novo access token e refresh token.",
})
export class TokenResponseDto {
	@IsString()
	@SchemaProperty({
		description: "Novo access token JWT gerado",
		example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
	})
	token!: string;

	@IsString()
	@SchemaProperty({
		description: "Novo refresh token JWT gerado",
		example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
	})
	refreshToken!: string;

	constructor(data: { token: string; refreshToken: string }) {
		this.token = data.token;
		this.refreshToken = data.refreshToken;
	}
} // @args { "token": "string", "refreshToken": "string" }
export interface TokenResponseDto {
	token: string;
	refreshToken: string;
}
