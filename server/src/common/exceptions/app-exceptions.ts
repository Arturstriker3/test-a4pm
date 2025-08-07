import { ApiResponse, HttpStatus } from "../responses";

/**
 * Classe base para exceções customizadas da aplicação
 */
export abstract class AppException extends Error {
	constructor(
		public readonly message: string,
		public readonly statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR
	) {
		super(message);
		this.name = this.constructor.name;
	}

	/**
	 * Converter a exceção em uma ApiResponse
	 */
	toApiResponse(): ApiResponse<null> {
		return new ApiResponse(this.statusCode, this.message, null);
	}
}

/**
 * Exceção para dados não encontrados
 */
export class NotFoundException extends AppException {
	constructor(message: string = "Recurso não encontrado") {
		super(message, HttpStatus.NOT_FOUND);
	}
}

/**
 * Exceção para dados inválidos
 */
export class BadRequestException extends AppException {
	constructor(message: string = "Dados inválidos") {
		super(message, HttpStatus.BAD_REQUEST);
	}
}

/**
 * Exceção para erros de validação de schema/DTO
 */
export class ValidationException extends AppException {
	constructor(message: string = "Erro de validação") {
		super(message, HttpStatus.BAD_REQUEST);
	}
}

/**
 * Exceção para conflito de dados (ex: email já existe)
 */
export class ConflictException extends AppException {
	constructor(message: string = "Conflito de dados") {
		super(message, HttpStatus.CONFLICT);
	}
}

/**
 * Exceção para acesso não autorizado
 */
export class UnauthorizedException extends AppException {
	constructor(message: string = "Acesso não autorizado") {
		super(message, HttpStatus.UNAUTHORIZED);
	}
}

/**
 * Exceção para acesso negado (usuário autenticado mas sem permissão)
 */
export class ForbiddenException extends AppException {
	constructor(message: string = "Acesso negado") {
		super(message, HttpStatus.FORBIDDEN);
	}
}

/**
 * Exceção para erro interno do servidor
 */
export class InternalServerErrorException extends AppException {
	constructor(message: string = "Erro interno do servidor") {
		super(message, HttpStatus.INTERNAL_SERVER_ERROR);
	}
}
