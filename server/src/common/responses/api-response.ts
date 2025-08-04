import { HttpMessages } from "./http-status";

/**
 * Classe de resposta padronizada para toda a aplicação
 */
export class ApiResponse<T = any> {
  constructor(
    public readonly code: number,
    public readonly message: string,
    public readonly data: T | null = null
  ) {}

  /**
   * Converte para o formato de resposta JSON sem o campo code
   */
  toJSON() {
    const response: { message: string; data?: any } = {
      message: this.message,
    };

    // Só inclui data se não for null
    if (this.data !== null) {
      response.data = this.data;
    }

    // Para Fins de Debugging
    // console.log("toJSON response:", response);
    return response;
  }

  /**
   * Criar uma resposta de sucesso
   */
  static success<T>(data: T, message?: string): ApiResponse<T> {
    return new ApiResponse(200, message || HttpMessages[200], data);
  }

  /**
   * Criar uma resposta de sucesso para criação
   */
  static created<T>(data: T, message?: string): ApiResponse<T> {
    return new ApiResponse(201, message || HttpMessages[201], data);
  }

  /**
   * Criar uma resposta de sucesso sem conteúdo
   */
  static noContent(message?: string): ApiResponse<null> {
    return new ApiResponse(204, message || HttpMessages[204], null);
  }

  /**
   * Criar uma resposta de erro de validação
   */
  static badRequest(message?: string): ApiResponse<null> {
    return new ApiResponse(400, message || HttpMessages[400], null);
  }

  /**
   * Criar uma resposta de não autorizado
   */
  static unauthorized(message?: string): ApiResponse<null> {
    return new ApiResponse(401, message || HttpMessages[401], null);
  }

  /**
   * Criar uma resposta de acesso negado
   */
  static forbidden(message?: string): ApiResponse<null> {
    return new ApiResponse(403, message || HttpMessages[403], null);
  }

  /**
   * Criar uma resposta de não encontrado
   */
  static notFound(message?: string): ApiResponse<null> {
    return new ApiResponse(404, message || HttpMessages[404], null);
  }

  /**
   * Criar uma resposta de conflito
   */
  static conflict(message?: string): ApiResponse<null> {
    return new ApiResponse(409, message || HttpMessages[409], null);
  }

  /**
   * Criar uma resposta de erro interno do servidor
   */
  static internalError(message?: string): ApiResponse<null> {
    return new ApiResponse(500, message || HttpMessages[500], null);
  }

  /**
   * Criar uma resposta com código HTTP personalizado
   */
  static custom<T>(
    code: number,
    data: T | null = null,
    message?: string
  ): ApiResponse<T> {
    const defaultMessage =
      HttpMessages[code as keyof typeof HttpMessages] || `Status ${code}`;
    return new ApiResponse(code, message || defaultMessage, data);
  }

  /**
   * Verificar se a resposta é de sucesso
   */
  get isSuccess(): boolean {
    return this.code >= 200 && this.code < 300;
  }

  /**
   * Verificar se a resposta é de erro
   */
  get isError(): boolean {
    return this.code >= 400;
  }
}
