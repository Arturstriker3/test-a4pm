import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { container } from "../common/container";
import { TYPES } from "../common/types";
import {
  getRouteMetadata,
  getControllerPrefix,
  HttpMethod,
} from "../common/decorators/route.decorators";
import {
  getRouteAccess,
  getAccessRoles,
  RouteAccessType,
} from "../modules/auth/decorators/access.decorators";
import {
  AuthMiddleware,
  JwtPayload,
} from "../common/middlewares/auth.middleware";
import { UserRole } from "../modules/users/entities/user.entity";
import { getMethodMetadata } from "../common/decorators/swagger.decorators";
import { getParamMetadata } from "../common/decorators/param.decorator";
import { ValidationException } from "../common/exceptions";
import { ApiResponse } from "../common/responses";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";

// Mapeamento dos controllers disponíveis
const CONTROLLERS = {
  AuthController: TYPES.AuthController,
  UsersController: TYPES.UsersController,
  CategoriesController: TYPES.CategoriesController,
  RecipesController: TYPES.RecipesController,
} as const;

/**
 * Registra automaticamente todas as rotas baseadas nos decorators dos controllers
 */
export async function registerRoutes(fastify: FastifyInstance): Promise<void> {
  for (const [controllerName, controllerType] of Object.entries(CONTROLLERS)) {
    try {
      // Tenta obter o controller do container
      const controller = container.get(controllerType) as any;
      const controllerClass = controller.constructor;

      // Obtém o prefixo do controller
      const controllerPrefix = getControllerPrefix(controllerClass);

      // Obtém os metadados das rotas
      const routes = getRouteMetadata(controllerClass);

      if (routes.length === 0) {
        console.log(`⚠️  No routes found for ${controllerName}`);
        continue;
      }

      console.log(`🔧 Registering routes for ${controllerName}:`);

      // Registra cada rota
      for (const route of routes) {
        const fullPath = `${controllerPrefix}${route.path}`;
        const method = route.method.toLowerCase() as Lowercase<HttpMethod>;

        // Obtém informações de acesso da rota
        const accessType = getRouteAccess(controller, route.methodName);
        const allowedRoles = getAccessRoles(controller, route.methodName);

        // Cria o handler da rota
        const routeHandler = createRouteHandler(
          controller,
          route.methodName,
          accessType,
          allowedRoles
        );

        // Cria as opções da rota para o Fastify (incluindo schema para Swagger)
        const routeOptions = {
          handler: routeHandler,
          schema: createSwaggerSchema(
            controllerPrefix,
            route,
            accessType,
            allowedRoles
          ),
          // Anexa validação mas não falha automaticamente (capturamos manualmente)
          attachValidation: true,
        };

        // Registra a rota no Fastify
        fastify[method](fullPath, routeOptions);

        console.log(
          `   ${method.toUpperCase()} ${fullPath} → ${controllerName}.${
            route.methodName
          }${accessType ? ` [${accessType}]` : ""}`
        );
      }
    } catch (error) {
      // Controller não está registrado no container ou não existe
      console.log(
        `⚠️  Controller ${controllerName} not available:`,
        error instanceof Error ? error.message : error
      );
    }
  }
}

/**
 * Cria um handler para a rota que inclui autenticação e autorização
 */
function createRouteHandler(
  controller: any,
  methodName: string,
  accessType?: RouteAccessType,
  allowedRoles?: UserRole[]
) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Ignora erros de validação do Fastify (usamos class-validator)
      if ((request as any).validationError) {
        // Ignora erro de validação do Fastify, será tratado pelo class-validator
      }

      // Verifica autenticação se necessário
      if (accessType === RouteAccessType.AUTHENTICATED) {
        // Extrai o token do header Authorization
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          const response = ApiResponse.unauthorized(
            "Token de acesso requerido"
          );
          return reply.status(response.code).send(response.toJSON());
        }

        const token = authHeader.substring(7); // Remove "Bearer "

        // Valida o token usando o AuthMiddleware
        const user: JwtPayload | null = AuthMiddleware.verifyToken(token);

        if (!user) {
          const response = ApiResponse.unauthorized("Token inválido");
          return reply.status(response.code).send(response.toJSON());
        }

        // Verifica se o usuário tem o role necessário
        if (allowedRoles && allowedRoles.length > 0) {
          if (!allowedRoles.includes(user.role as UserRole)) {
            const response = ApiResponse.forbidden("Acesso negado");
            return reply.status(response.code).send(response.toJSON());
          }
        }

        // Adiciona o usuário na request para uso no controller
        (request as any).user = user;
      }

      // Prepara os parâmetros para o método do controller usando decorators @Param
      const params = await extractParametersWithDecorators(
        request,
        controller,
        methodName
      );

      // Valida body com class-validator se for um método com body
      const method = request.method.toLowerCase();
      if (["post", "put", "patch"].includes(method) && request.body) {
        await validateRequestBody(request.body, methodName, controller);
      }

      // Chama o método do controller
      const result = await controller[methodName](...params);

      // Se o resultado já é uma ApiResponse, usa o status correto e nova estrutura
      if (
        result &&
        typeof result === "object" &&
        "code" in result &&
        "message" in result &&
        typeof result.toJSON === "function"
      ) {
        const jsonResponse = result.toJSON();
        // Para Fins de Debugging
        // console.log("Sending response:", JSON.stringify(jsonResponse, null, 2));
        return reply
          .status(result.code)
          .type("application/json")
          .send(JSON.stringify(jsonResponse));
      }

      // Caso contrário, envolve em uma resposta de sucesso
      return reply.send({
        success: true,
        data: result,
      });
    } catch (error) {
      // Se for ValidationException, retorna como BadRequest (sem log de erro)
      if (error instanceof ValidationException) {
        const response = error.toApiResponse();
        return reply.status(response.code).send(response.toJSON());
      }

      // Para outros erros, loga e retorna erro interno
      console.error(`Error in ${methodName}:`, error);
      const response = ApiResponse.internalError("Erro interno do servidor");
      return reply.status(response.code).send(response.toJSON());
    }
  };
}

/**
 * Extrai parâmetros para o método do controller baseado na request
 */
function extractMethodParameters(
  request: FastifyRequest,
  methodName: string
): any[] {
  const method = request.method.toLowerCase();
  const hasParams = request.params && Object.keys(request.params).length > 0;
  const hasQuery = request.query && Object.keys(request.query).length > 0;
  const hasBody = request.body && Object.keys(request.body as any).length > 0;

  // Para métodos com body (POST, PUT, PATCH)
  if (["post", "put", "patch"].includes(method)) {
    if (hasParams && hasBody) {
      // Se tem parâmetros na URL e body, passa ambos
      return [request.params, request.body];
    } else if (hasBody) {
      // Só body
      return [request.body];
    } else if (hasParams) {
      // Só parâmetros
      return [request.params];
    }
  }

  // Para métodos GET e DELETE
  if (hasParams && hasQuery) {
    // Se tem ambos, passa parâmetros primeiro e query depois
    return [request.params, request.query];
  } else if (hasParams) {
    // Só parâmetros da URL
    return [request.params];
  } else if (hasQuery) {
    // Só query parameters
    return [request.query];
  }

  // Sem parâmetros
  return [];
}

/**
 * Extrai e valida parâmetros usando decorators @Param
 * Nova funcionalidade similar ao NestJS
 */
async function extractParametersWithDecorators(
  request: FastifyRequest,
  controller: any,
  methodName: string
): Promise<any[]> {
  const paramMetadata = getParamMetadata(controller, methodName);

  if (paramMetadata.length === 0) {
    // Fallback para o método antigo se não tiver decorators @Param
    return extractMethodParameters(request, methodName);
  }

  // Ordenar por índice do parâmetro
  paramMetadata.sort((a, b) => a.index - b.index);

  const parameters: any[] = [];

  for (const param of paramMetadata) {
    const paramValue = (request.params as any)?.[param.paramName];

    if (param.dtoClass) {
      // Validar usando DTO
      const dto = plainToClass(param.dtoClass, {
        [param.paramName]: paramValue,
      });
      const errors = await validate(dto);

      if (errors.length > 0) {
        const firstError = errors[0];
        const message =
          Object.values(firstError.constraints || {})[0] ||
          `Erro de validação no parâmetro ${param.paramName}`;
        throw new ValidationException(message);
      }

      // Retorna apenas o valor validado
      parameters[param.index] = paramValue;
    } else {
      // Sem validação, apenas passa o valor
      parameters[param.index] = paramValue;
    }
  }

  return parameters;
}

/**
 * Cria o schema do Swagger para uma rota específica
 */
function createSwaggerSchema(
  controllerPrefix: string,
  route: any,
  accessType?: RouteAccessType,
  allowedRoles?: UserRole[]
) {
  // Remove a barra inicial do prefixo para criar o nome da tag
  const tagName =
    controllerPrefix.replace(/^\//, "").charAt(0).toUpperCase() +
    controllerPrefix.replace(/^\//, "").slice(1);

  // Obtém metadados dos decorators Swagger
  const controller = container.get(
    TYPES[`${tagName}Controller` as keyof typeof TYPES]
  ) as any;
  const swaggerMetadata = getMethodMetadata(controller, route.methodName);

  // Cria o nome/summary baseado no acesso ou usa o do decorator
  let summary = "";
  if (swaggerMetadata.operation?.summary) {
    summary = swaggerMetadata.operation.summary;
  } else if (accessType === RouteAccessType.PUBLIC) {
    summary = "🌐 Público";
  } else if (accessType === RouteAccessType.AUTHENTICATED) {
    if (allowedRoles && allowedRoles.length > 0) {
      summary = `🔒 ${allowedRoles.join(", ")}`;
    } else {
      summary = "🔒 Usuários Autenticados";
    }
  } else {
    summary = "🔓 Sem restrição";
  }

  // Descrição com mais detalhes
  let description = `Endpoint: ${route.methodName}`;
  if (swaggerMetadata.operation?.description) {
    description = swaggerMetadata.operation.description;
  }

  // Schema base
  const schema: any = {
    tags: [tagName],
    summary: summary,
    description: description,
  };

  // Adiciona body schema APENAS para documentação Swagger (sem validação)
  if (swaggerMetadata.body) {
    // Mantém o schema original com examples para documentação
    const bodySchema = { ...swaggerMetadata.body.schema };

    // IMPORTANTE: Mantém os examples para mostrar na documentação
    schema.body = bodySchema;
  }

  // Adiciona responses se houver metadados de resposta
  if (swaggerMetadata.responses && swaggerMetadata.responses.length > 0) {
    schema.response = {};
    swaggerMetadata.responses.forEach((response: any) => {
      schema.response[response.status] = {
        description: response.description,
        type: "object",
        properties: response.schema?.properties || {},
      };
    });
  }

  return schema;
}

/**
 * Valida o body da request usando class-validator
 */
async function validateRequestBody(
  body: any,
  methodName: string,
  controller: any
): Promise<void> {
  // Mapeamento dos DTOs por método
  const dtoMap: { [key: string]: any } = {
    register: require("../modules/auth/dto").RegisterDto,
    login: require("../modules/auth/dto").LoginDto,
  };

  const DtoClass = dtoMap[methodName];
  if (!DtoClass) {
    return; // Sem validação se não tiver DTO mapeado
  }

  // Converte o body para instância do DTO
  const dto = plainToClass(DtoClass, body);

  // Valida usando class-validator
  const errors = await validate(dto);

  if (errors.length > 0) {
    // Pega a primeira mensagem de erro
    const firstError = errors[0];
    const message =
      Object.values(firstError.constraints || {})[0] || "Erro de validação";
    throw new ValidationException(message);
  }
}

/**
 * Valida parâmetros da URL usando class-validator (FUTURO)
 * Atualmente o projeto usa validação manual nos controllers
 */
async function validateRequestParams(
  params: any,
  methodName: string,
  controller: any
): Promise<void> {
  // Mapeamento dos DTOs para parâmetros por método
  const paramDtoMap: { [key: string]: any } = {
    // logout: require("../modules/users/dto").UserIdDto,
    // Adicione aqui outros métodos que precisam validar parâmetros
  };

  const DtoClass = paramDtoMap[methodName];
  if (!DtoClass) {
    return; // Sem validação se não tiver DTO mapeado
  }

  // Converte os parâmetros para instância do DTO
  const dto = plainToClass(DtoClass, params);

  // Valida usando class-validator
  const errors = await validate(dto);

  if (errors.length > 0) {
    // Pega a primeira mensagem de erro
    const firstError = errors[0];
    const message =
      Object.values(firstError.constraints || {})[0] ||
      "Erro de validação de parâmetros";
    throw new ValidationException(message);
  }
}
