import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { container } from "../common/container";
import { TYPES } from "../common/types";
import { getRouteMetadata, getControllerPrefix, HttpMethod } from "../common/decorators/route.decorators";
import { getRouteAccess, getAccessRoles, RouteAccessType } from "../modules/auth/decorators/access.decorators";
import { AuthMiddleware, JwtPayload } from "../common/middlewares/auth.middleware";
import { UserRole } from "../modules/users/entities/user.entity";
import { getMethodMetadata } from "../common/decorators/swagger.decorators";
import { getParamMetadata, getQueryMetadata } from "../common/decorators/param.decorator";
import { getCurrentUserMetadata } from "../common/decorators/current-user.decorator";
import { getCurrentUserFullMetadata } from "../common/decorators/current-user-full.decorator";
import { BODY_METADATA_KEY, BodyMetadata } from "../common/decorators/body.decorator";
import { ValidationException } from "../common/exceptions";
import { ApiResponse } from "../common/responses";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";
import { getSchemaFromDto, getSchemaWithExamplesFromDto } from "../common/decorators/schema.decorators";

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
				const routeHandler = createRouteHandler(controller, route.methodName, accessType, allowedRoles);

				// Cria as opções da rota para o Fastify (incluindo schema para Swagger)
				const routeOptions = {
					handler: routeHandler,
					schema: createFastifySchema(controllerPrefix, route, accessType, allowedRoles),
					// Anexa validação mas não falha automaticamente (capturamos manualmente)
					attachValidation: true,
				};

				// Registra a rota no Fastify
				fastify[method](fullPath, routeOptions);

				console.log(`   ${method.toUpperCase()} ${fullPath} → ${controllerName}.${route.methodName}${accessType ? ` [${accessType}]` : ""}`);
			}
		} catch (error) {
			// Controller não está registrado no container ou não existe
			console.log(`⚠️  Controller ${controllerName} not available:`, error instanceof Error ? error.message : error);
		}
	}
}

/**
 * Cria um handler para a rota que inclui autenticação e autorização
 */
function createRouteHandler(controller: any, methodName: string, accessType?: RouteAccessType, allowedRoles?: UserRole[]) {
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
					const response = ApiResponse.unauthorized("Token de acesso requerido");
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
			const params = await extractParametersWithDecorators(request, controller, methodName);

			// Valida body com class-validator se for um método com body
			const method = request.method.toLowerCase();
			if (["post", "put", "patch"].includes(method) && request.body) {
				await validateRequestBody(request.body, methodName, controller);
			}

			// Chama o método do controller
			const result = await controller[methodName](...params);

			// Se o resultado já é uma ApiResponse, usa o status correto e nova estrutura
			if (result && typeof result === "object" && "code" in result && "message" in result && typeof result.toJSON === "function") {
				const jsonResponse = result.toJSON();
				// Para Fins de Debugging
				// console.log("Sending response:", JSON.stringify(jsonResponse, null, 2));
				return reply.status(result.code).type("application/json").send(JSON.stringify(jsonResponse));
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
function extractMethodParameters(request: FastifyRequest, methodName: string): any[] {
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
 * Extrai e valida parâmetros usando decorators @Param, @Query, @Body e @CurrentUser
 * Nova funcionalidade similar ao NestJS
 */
async function extractParametersWithDecorators(request: FastifyRequest, controller: any, methodName: string): Promise<any[]> {
	const paramMetadata = getParamMetadata(controller, methodName);
	const queryMetadata = getQueryMetadata(controller, methodName);
	const currentUserMetadata = getCurrentUserMetadata(controller, methodName);
	const currentUserFullMetadata = getCurrentUserFullMetadata(controller, methodName);
	const bodyMetadata: BodyMetadata[] = Reflect.getMetadata(BODY_METADATA_KEY, controller, methodName) || [];

	const totalDecorators = paramMetadata.length + (queryMetadata ? 1 : 0) + currentUserMetadata.length + currentUserFullMetadata.length + bodyMetadata.length;
	const methodParamCount = controller[methodName].length;

	if (totalDecorators === 0) {
		// Verifica se o método espera parâmetros mesmo sem decorators
		const method = controller[methodName];
		if (method && method.length > 0) {
			// Se o método espera parâmetros mas não tem decorators,
			// passa o request inteiro como primeiro parâmetro
			return [request];
		}
		// Fallback para o método antigo se não tiver decorators e não esperar parâmetros
		return extractMethodParameters(request, methodName);
	}

	// Inicializa array de parâmetros com o tamanho do número de parâmetros do método
	const parameters: any[] = new Array(methodParamCount);

	// Processa parâmetros @Param
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
				const message = Object.values(firstError.constraints || {})[0] || `Erro de validação no parâmetro ${param.paramName}`;
				throw new ValidationException(message);
			}

			// Retorna apenas o valor validado
			parameters[param.index] = paramValue;
		} else {
			// Sem validação, apenas passa o valor
			parameters[param.index] = paramValue;
		}
	}

	// Processa parâmetros @Query
	if (queryMetadata) {
		if (queryMetadata.dtoClass) {
			// Validar query parameters usando DTO
			const queryDto = plainToClass(queryMetadata.dtoClass, request.query || {});
			const errors = await validate(queryDto);

			if (errors.length > 0) {
				const firstError = errors[0];
				const message = Object.values(firstError.constraints || {})[0] || "Erro de validação nos query parameters";
				throw new ValidationException(message);
			}

			parameters[queryMetadata.index] = queryDto;
		} else {
			// Sem validação, passa o objeto query inteiro
			parameters[queryMetadata.index] = request.query;
		}
	}

	// Processa parâmetros @Body
	for (const body of bodyMetadata) {
		if (body.dtoClass) {
			// Validar body usando DTO
			const bodyDto = plainToClass(body.dtoClass, request.body || {});
			const errors = await validate(bodyDto as object);

			if (errors.length > 0) {
				const firstError = errors[0];
				const message = Object.values(firstError.constraints || {})[0] || "Erro de validação no body da requisição";
				throw new ValidationException(message);
			}

			parameters[body.index] = bodyDto;
		} else {
			// Sem validação, passa o body inteiro
			parameters[body.index] = request.body;
		}
	}

	// Processa parâmetros @CurrentUser
	for (const userParam of currentUserMetadata) {
		// Extrai o usuário autenticado do request
		const user = (request as any).user;
		// O @CurrentUser decorator deve retornar apenas o userId (string)
		parameters[userParam.index] = user?.userId;
	}

	// Processa parâmetros @CurrentUserFull
	for (const userFullParam of currentUserFullMetadata) {
		// Extrai o usuário autenticado completo do request
		const user = (request as any).user;
		// O @CurrentUserFull decorator deve retornar o usuário completo
		parameters[userFullParam.index] = user;
	}

	return parameters;
}

/**
 * Cria o schema do Fastify para validação (SEM examples)
 */
function createFastifySchema(controllerPrefix: string, route: any, accessType?: RouteAccessType, allowedRoles?: UserRole[]) {
	// Remove a barra inicial do prefixo para criar o nome da tag
	const tagName = controllerPrefix.replace(/^\//, "").charAt(0).toUpperCase() + controllerPrefix.replace(/^\//, "").slice(1);

	// Obtém metadados dos decorators Swagger
	const controller = container.get(TYPES[`${tagName}Controller` as keyof typeof TYPES]) as any;
	const swaggerMetadata = getMethodMetadata(controller, route.methodName);

	// Schema base para Fastify (focado em validação)
	const schema: any = {};

	// Adiciona body schema para Fastify (SEM examples para evitar conflitos)
	if (swaggerMetadata.body) {
		if (swaggerMetadata.body.type) {
			// Para o Fastify: usa schema limpo sem examples
			const cleanSchema = getSchemaFromDto(swaggerMetadata.body.type);
			schema.body = cleanSchema;
		} else {
			// Senão usa o schema fornecido (sem examples)
			schema.body = swaggerMetadata.body.schema;
		}
	}

	return schema;
}

/**
 * Cria o schema do Swagger para documentação (COM examples)
 */
function createSwaggerSchema(controllerPrefix: string, route: any, accessType?: RouteAccessType, allowedRoles?: UserRole[]) {
	// Remove a barra inicial do prefixo para criar o nome da tag
	const tagName = controllerPrefix.replace(/^\//, "").charAt(0).toUpperCase() + controllerPrefix.replace(/^\//, "").slice(1);

	// Obtém metadados dos decorators Swagger
	const controller = container.get(TYPES[`${tagName}Controller` as keyof typeof TYPES]) as any;
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

	// Schema base para Swagger (focado em documentação)
	const schema: any = {
		tags: [tagName],
		summary: summary,
		description: description,
	};

	// Adiciona body schema para Swagger (COM examples para melhor documentação)
	if (swaggerMetadata.body) {
		if (swaggerMetadata.body.type) {
			// Para o Swagger: usa schema com examples
			const schemaWithExamples = getSchemaWithExamplesFromDto(swaggerMetadata.body.type);
			schema.body = schemaWithExamples;
		} else {
			// Senão usa o schema fornecido (sem examples)
			schema.body = swaggerMetadata.body.schema;
		}
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
 * Valida o body da request usando class-validator automaticamente
 */
async function validateRequestBody(body: any, methodName: string, controller: any): Promise<void> {
	// Tenta detectar automaticamente o DTO baseado nos metadados do Swagger
	const swaggerMetadata = getMethodMetadata(controller, methodName);

	if (!swaggerMetadata.body?.schema?.properties) {
		return; // Sem schema definido, não valida
	}

	// Extrai o nome do DTO do schema ou usa convenção de nomes
	let DtoClass: any = null;

	// Primeiro, tenta encontrar o DTO usando convenções de nome baseadas no método
	const controllerName = controller.constructor.name.replace("Controller", "");
	const moduleName = controllerName.toLowerCase();

	try {
		// Tenta diferentes convenções de nome para o DTO
		const possibleDtoNames = [
			// Para métodos create*: Create{Entity}Dto
			methodName.replace(/^create/, "Create") + "Dto",
			// Para métodos update*: Update{Entity}Dto
			methodName.replace(/^update/, "Update") + "Dto",
			// Para métodos register: RegisterDto
			methodName.charAt(0).toUpperCase() + methodName.slice(1) + "Dto",
			// Para métodos login: LoginDto
			methodName.charAt(0).toUpperCase() + methodName.slice(1) + "Dto",
		];

		// Tenta encontrar o DTO em diferentes locais
		for (const dtoName of possibleDtoNames) {
			try {
				// Tenta no módulo específico
				const moduleDto = require(`../modules/${moduleName}/dto`);
				if (moduleDto[dtoName]) {
					DtoClass = moduleDto[dtoName];
					break;
				}
			} catch (error) {
				// Continue tentando
			}

			try {
				// Tenta no módulo auth (para login/register)
				const authDto = require("../modules/auth/dto");
				if (authDto[dtoName]) {
					DtoClass = authDto[dtoName];
					break;
				}
			} catch (error) {
				// Continue tentando
			}
		}

		// Se não encontrou por convenção, tenta um mapeamento manual para casos específicos
		if (!DtoClass) {
			const manualMap: { [key: string]: { module: string; dto: string } } = {
				register: { module: "auth", dto: "RegisterDto" },
				login: { module: "auth", dto: "LoginDto" },
				createRecipe: { module: "recipes", dto: "CreateRecipeDto" },
				// Adicione aqui apenas casos que não seguem a convenção
			};

			const manualMapping = manualMap[methodName];
			if (manualMapping) {
				try {
					const moduleDto = require(`../modules/${manualMapping.module}/dto`);
					DtoClass = moduleDto[manualMapping.dto];
				} catch (error) {
					console.warn(`⚠️  Não foi possível carregar DTO ${manualMapping.dto} do módulo ${manualMapping.module}`);
				}
			}
		}
	} catch (error) {
		console.warn(`⚠️  Erro ao tentar detectar DTO automaticamente para ${methodName}:`, error instanceof Error ? error.message : error);
	}

	if (!DtoClass) {
		console.warn(`⚠️  DTO não encontrado para validação do método ${methodName}. Pulando validação.`);
		return; // Sem validação se não conseguir encontrar o DTO
	}

	// Converte o body para instância do DTO
	const dto = plainToClass(DtoClass, body);

	// Valida usando class-validator
	const errors = await validate(dto);

	if (errors.length > 0) {
		// Pega a primeira mensagem de erro
		const firstError = errors[0];
		const message = Object.values(firstError.constraints || {})[0] || "Erro de validação";
		throw new ValidationException(message);
	}
}

/**
 * Valida parâmetros da URL usando class-validator (FUTURO)
 * Atualmente o projeto usa validação manual nos controllers
 */
async function validateRequestParams(params: any, methodName: string, controller: any): Promise<void> {
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
		const message = Object.values(firstError.constraints || {})[0] || "Erro de validação de parâmetros";
		throw new ValidationException(message);
	}
}
