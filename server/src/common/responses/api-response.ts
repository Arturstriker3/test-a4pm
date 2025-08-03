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
   * Criar uma resposta de sucesso
   */
  static success<T>(
    data: T,
    message: string = "Operação realizada com sucesso"
  ): ApiResponse<T> {
    return new ApiResponse(200, message, data);
  }

  /**
   * Criar uma resposta de sucesso para criação
   */
  static created<T>(
    data: T,
    message: string = "Recurso criado com sucesso"
  ): ApiResponse<T> {
    return new ApiResponse(201, message, data);
  }

  /**
   * Criar uma resposta de sucesso sem conteúdo
   */
  static noContent(
    message: string = "Operação realizada com sucesso"
  ): ApiResponse<null> {
    return new ApiResponse(204, message, null);
  }

  /**
   * Criar uma resposta de erro de validação
   */
  static badRequest(message: string = "Dados inválidos"): ApiResponse<null> {
    return new ApiResponse(400, message, null);
  }

  /**
   * Criar uma resposta de não autorizado
   */
  static unauthorized(
    message: string = "Acesso não autorizado"
  ): ApiResponse<null> {
    return new ApiResponse(401, message, null);
  }

  /**
   * Criar uma resposta de acesso negado
   */
  static forbidden(message: string = "Acesso negado"): ApiResponse<null> {
    return new ApiResponse(403, message, null);
  }

  /**
   * Criar uma resposta de não encontrado
   */
  static notFound(
    message: string = "Recurso não encontrado"
  ): ApiResponse<null> {
    return new ApiResponse(404, message, null);
  }

  /**
   * Criar uma resposta de conflito
   */
  static conflict(message: string = "Conflito de dados"): ApiResponse<null> {
    return new ApiResponse(409, message, null);
  }

  /**
   * Criar uma resposta de erro interno do servidor
   */
  static internalError(
    message: string = "Erro interno do servidor"
  ): ApiResponse<null> {
    return new ApiResponse(500, message, null);
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
