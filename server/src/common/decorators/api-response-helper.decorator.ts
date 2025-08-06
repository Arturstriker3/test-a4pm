import { HttpMessages } from "../responses/http-status";
import { ApiResponse as ApiResponseDoc } from "./swagger.decorators";
import { SCHEMA_PROPERTY_METADATA } from "./schema.decorators";

/**
 * Interface para definir exemplos de propriedades
 */
interface PropertyExample {
  [key: string]: any;
}

/**
 * Configuração para gerar documentação de resposta automaticamente
 */
interface ApiResponseConfig<T = any> {
  status: number;
  description?: string;
  dataType?: any; // Mudança aqui para aceitar qualquer tipo
  examples?: PropertyExample;
  messageExample?: string;
}

/**
 * Gera a estrutura base da resposta da API
 */
function generateResponseSchema(
  status: number,
  description?: string,
  dataType?: any,
  examples?: PropertyExample,
  messageExample?: string
) {
  const isSuccessStatus = status >= 200 && status < 300;
  const defaultMessage = HttpMessages[status as keyof typeof HttpMessages] || `Status ${status}`;

  const schema: any = {
    type: "object",
    properties: {
      message: {
        type: "string",
        example: messageExample || defaultMessage,
      },
    },
  };

  // Só inclui data para status de sucesso e se houver dataType
  if (isSuccessStatus && dataType) {
    schema.properties.data = generateDataSchema(dataType, examples);
  }

  return {
    status,
    description: description || defaultMessage,
    schema,
  };
}

/**
 * Gera o schema do campo data baseado no tipo do DTO
 */
function generateDataSchema(dataType: any, examples?: PropertyExample) {
  if (!dataType) {
    return {
      type: "object",
      additionalProperties: true,
    };
  }

  const properties: any = {};

  try {
    // Cria uma instância temporária para acessar os metadados
    const instance = new dataType({});

    // Lê os metadados do @SchemaProperty
    const schemaMetadata = Reflect.getMetadata(SCHEMA_PROPERTY_METADATA, instance) || {};

    // Pega todas as propriedades da instância
    const propertyKeys = Object.keys(instance);

    if (propertyKeys.length > 0) {
      // Usa as propriedades reais do DTO
      propertyKeys.forEach((key) => {
        const metadata = schemaMetadata[key];

        if (metadata) {
          // Usa os metadados do @SchemaProperty
          properties[key] = {
            type: metadata.type || "string",
            description: metadata.description,
            example: examples?.[key] || metadata.example,
            format: metadata.format,
            enum: metadata.enum,
          };

          // Remove propriedades undefined
          Object.keys(properties[key]).forEach((prop) => {
            if (properties[key][prop] === undefined) {
              delete properties[key][prop];
            }
          });
        } else {
          // Fallback para propriedades sem @SchemaProperty
          properties[key] = generatePropertySchema(key, examples);
        }
      });
    } else {
      // Fallback se não conseguir criar instância
      return generateFallbackSchema(dataType, examples);
    }
  } catch (error) {
    console.warn("Erro ao gerar schema do DTO:", error);
    return generateFallbackSchema(dataType, examples);
  }

  return {
    type: "object",
    properties,
  };
}

/**
 * Gera schema fallback quando não consegue extrair metadados
 */
function generateFallbackSchema(dataType: any, examples?: PropertyExample) {
  const typeName = dataType.name || "Unknown";
  const properties: any = {};

  // Para LoginResponseDto especificamente
  if (typeName.includes("Login")) {
    properties.token = {
      type: "string",
      example: examples?.token || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    };
    properties.user = {
      type: "object",
      properties: {
        id: { type: "string", example: examples?.user?.id || "user-123" },
        nome: { type: "string", example: examples?.user?.nome || "João Silva" },
        login: {
          type: "string",
          example: examples?.user?.login || "joao@example.com",
        },
        nivel_acesso: {
          type: "string",
          example: examples?.user?.nivel_acesso || "DEFAULT",
        },
      },
    };
  } else {
    // Propriedades padrão para outros DTOs
    const commonProperties = ["id", "nome", "login"];

    commonProperties.forEach((prop) => {
      properties[prop] = generatePropertySchema(prop, examples);
    });

    // Adiciona propriedades de timestamp se for um DTO de resposta
    if (typeName.includes("Response") || typeName.includes("Dto")) {
      properties.criado_em = { type: "string", format: "date-time" };
      properties.alterado_em = { type: "string", format: "date-time" };
    }
  }

  return {
    type: "object",
    properties,
  };
}

/**
 * Gera o schema de uma propriedade específica
 */
function generatePropertySchema(propertyName: string, examples?: PropertyExample) {
  const example = examples?.[propertyName];

  // Mapeia tipos baseado no nome da propriedade
  if (propertyName.includes("id")) {
    return { type: "string", example: example || `${propertyName}-123` };
  }

  if (propertyName.includes("email") || propertyName.includes("login")) {
    return { type: "string", example: example || "user@example.com" };
  }

  if (propertyName.includes("nome") || propertyName.includes("titulo")) {
    return { type: "string", example: example || "Exemplo" };
  }

  if (propertyName.includes("descricao")) {
    return { type: "string", example: example || "Descrição do item" };
  }

  if (propertyName.includes("tempo") || propertyName.includes("numero")) {
    return { type: "number", example: example || 30 };
  }

  if (propertyName.includes("ingredientes") || propertyName.includes("tags")) {
    return {
      type: "array",
      items: { type: "string" },
      example: example || ["item1", "item2"],
    };
  }

  if (propertyName.includes("_em") || propertyName.includes("_at")) {
    return { type: "string", format: "date-time", example: example };
  }

  if (propertyName.includes("ativo") || propertyName.includes("enabled")) {
    return { type: "boolean", example: example !== undefined ? example : true };
  }

  // Padrão para string
  return { type: "string", example: example || `Exemplo ${propertyName}` };
}

/**
 * Decorator para resposta de sucesso (200)
 */
export function ApiSuccessResponse<T>(config: Omit<ApiResponseConfig<T>, "status">) {
  return ApiResponseDoc(
    generateResponseSchema(200, config.description, config.dataType, config.examples, config.messageExample)
  );
}

/**
 * Decorator para resposta de criação (201)
 */
export function ApiCreatedResponse<T>(config: Omit<ApiResponseConfig<T>, "status">) {
  return ApiResponseDoc(
    generateResponseSchema(201, config.description, config.dataType, config.examples, config.messageExample)
  );
}

/**
 * Decorator para resposta sem conteúdo (204)
 */
export function ApiNoContentResponse(config?: Omit<ApiResponseConfig<never>, "status" | "dataType">) {
  return ApiResponseDoc(generateResponseSchema(204, config?.description, undefined, undefined, config?.messageExample));
}

/**
 * Decorator para resposta de erro de validação (400)
 */
export function ApiBadRequestResponse(config?: Omit<ApiResponseConfig<never>, "status" | "dataType">) {
  return ApiResponseDoc(generateResponseSchema(400, config?.description, undefined, undefined, config?.messageExample));
}

/**
 * Decorator para resposta de não autorizado (401)
 */
export function ApiUnauthorizedResponse(config?: Omit<ApiResponseConfig<never>, "status" | "dataType">) {
  return ApiResponseDoc(generateResponseSchema(401, config?.description, undefined, undefined, config?.messageExample));
}

/**
 * Decorator para resposta de acesso negado (403)
 */
export function ApiForbiddenResponse(config?: Omit<ApiResponseConfig<never>, "status" | "dataType">) {
  return ApiResponseDoc(generateResponseSchema(403, config?.description, undefined, undefined, config?.messageExample));
}

/**
 * Decorator para resposta de não encontrado (404)
 */
export function ApiNotFoundResponse(config?: Omit<ApiResponseConfig<never>, "status" | "dataType">) {
  return ApiResponseDoc(generateResponseSchema(404, config?.description, undefined, undefined, config?.messageExample));
}

/**
 * Decorator para resposta de conflito (409)
 */
export function ApiConflictResponse(config?: Omit<ApiResponseConfig<never>, "status" | "dataType">) {
  return ApiResponseDoc(generateResponseSchema(409, config?.description, undefined, undefined, config?.messageExample));
}

/**
 * Decorator genérico para qualquer código de status
 */
export function ApiCustomResponse<T>(config: ApiResponseConfig<T>) {
  return ApiResponseDoc(
    generateResponseSchema(config.status, config.description, config.dataType, config.examples, config.messageExample)
  );
}
