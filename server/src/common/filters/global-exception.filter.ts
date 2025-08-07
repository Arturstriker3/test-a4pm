import { ApiResponse } from "../responses";
import { AppException } from "../exceptions";

/**
 * Global Exception Filter - similar ao NestJS
 * Intercepta todas as exceções e retorna uma resposta padronizada
 */
export class GlobalExceptionFilter {
	/**
	 * Captura e trata todas as exceções da aplicação
	 */
	static catch(error: Error): ApiResponse {
		// Se for uma exceção customizada da aplicação
		if (error instanceof AppException) {
			return error.toApiResponse();
		}

		// Tratar erros específicos do class-validator
		if (this.isValidationError(error)) {
			return ApiResponse.badRequest(error.message);
		}

		// Tratar erros de banco de dados
		if (this.isDatabaseError(error)) {
			return this.handleDatabaseError(error);
		}

		// Para erros não mapeados, retorna erro interno
		console.error("Unhandled error:", error);
		return ApiResponse.internalError("Erro interno do servidor");
	}

	/**
	 * Verifica se é um erro de validação do class-validator
	 */
	private static isValidationError(error: Error): boolean {
		return error.name === "ValidationError" || error.message.includes("validation failed") || error.message.includes("deve ter") || error.message.includes("deve ser") || error.message.includes("inválid");
	}

	/**
	 * Verifica se é um erro de banco de dados
	 */
	private static isDatabaseError(error: Error): boolean {
		return (
			error.message.includes("ER_") || // MySQL errors
			error.message.includes("ECONNREFUSED") ||
			error.message.includes("Connection") ||
			error.name.includes("QueryFailedError")
		);
	}

	/**
	 * Trata erros específicos de banco de dados
	 */
	private static handleDatabaseError(error: Error): ApiResponse {
		if (error.message.includes("ER_DUP_ENTRY")) {
			return ApiResponse.conflict("Dados duplicados");
		}

		if (error.message.includes("ECONNREFUSED")) {
			return ApiResponse.internalError("Erro de conexão com o banco de dados");
		}

		return ApiResponse.internalError("Erro no banco de dados");
	}
}
