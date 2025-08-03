/**
 * Códigos de status HTTP mais comuns
 */
export enum HttpStatus {
  // Success
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,

  // Client Errors
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,

  // Server Errors
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
}

/**
 * Mensagens padrão para cada status HTTP
 */
export const HttpMessages = {
  [HttpStatus.OK]: "Operação realizada com sucesso",
  [HttpStatus.CREATED]: "Recurso criado com sucesso",
  [HttpStatus.ACCEPTED]: "Solicitação aceita",
  [HttpStatus.NO_CONTENT]: "Operação realizada com sucesso",

  [HttpStatus.BAD_REQUEST]: "Dados inválidos",
  [HttpStatus.UNAUTHORIZED]: "Acesso não autorizado",
  [HttpStatus.FORBIDDEN]: "Acesso negado",
  [HttpStatus.NOT_FOUND]: "Recurso não encontrado",
  [HttpStatus.METHOD_NOT_ALLOWED]: "Método não permitido",
  [HttpStatus.CONFLICT]: "Conflito de dados",
  [HttpStatus.UNPROCESSABLE_ENTITY]: "Dados não processáveis",

  [HttpStatus.INTERNAL_SERVER_ERROR]: "Erro interno do servidor",
  [HttpStatus.NOT_IMPLEMENTED]: "Funcionalidade não implementada",
  [HttpStatus.BAD_GATEWAY]: "Gateway inválido",
  [HttpStatus.SERVICE_UNAVAILABLE]: "Serviço indisponível",
} as const;
