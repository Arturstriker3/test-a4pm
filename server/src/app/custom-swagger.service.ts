import { FastifyInstance } from "fastify";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { networkInterfaces } from "os";
import { container } from "../common/container";
import { TYPES } from "../common/types";
import { getMethodMetadata, SWAGGER_METADATA } from "../common/decorators/swagger.decorators";
import { getSchemaFromDto } from "../common/decorators/schema.decorators";

/**
 * Função para obter informações de rede (local e IPs externos)
 */
function getNetworkInfo(port: number, prefix: string = "") {
  const networks = networkInterfaces();
  const addresses: string[] = [];

  for (const name of Object.keys(networks)) {
    for (const net of networks[name] || []) {
      if (net.family === "IPv4" && !net.internal) {
        addresses.push(`http://${net.address}:${port}${prefix}`);
      }
    }
  }

  return {
    local: `http://localhost:${port}${prefix}`,
    network: addresses,
  };
}

interface SwaggerPath {
  [key: string]: {
    [method: string]: {
      tags?: string[];
      summary?: string;
      description?: string;
      requestBody?: any;
      responses?: any;
      security?: any[];
    };
  };
}

interface SwaggerDefinition {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  servers: Array<{
    url: string;
    description: string;
  }>;
  components: {
    securitySchemes: any;
    schemas: any;
  };
  paths: SwaggerPath;
}

export class CustomSwaggerService {
  private swaggerDefinition: SwaggerDefinition;
  private schemas: { [key: string]: any } = {};

  constructor() {
    const apiPrefix = process.env.SERVER_PREFIX || "/api";
    const port = Number(process.env.PORT) || 3001;
    const apiName = process.env.API_NAME || "API A4PM";

    // Configurar múltiplos servidores (localhost + IPs da rede)
    const { local, network } = getNetworkInfo(port, apiPrefix);
    const servers = [
      {
        url: local,
        description: "Servidor local",
      },
    ];

    // Adicionar servidores de rede
    network.forEach((networkUrl, index) => {
      servers.push({
        url: networkUrl,
        description: `Servidor de rede ${index + 1}`,
      });
    });

    this.swaggerDefinition = {
      openapi: "3.0.0",
      info: {
        title: apiName,
        version: "1.0.0",
        description: `${apiName} - Documentação da API`,
      },
      servers,
      components: {
        securitySchemes: {
          BearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
        schemas: {},
      },
      paths: {},
    };
  }

  /**
   * Gera a documentação Swagger baseada nos decorators dos controllers
   */
  generateSwaggerFromControllers(): any {
    this.collectRouteMetadata();
    this.swaggerDefinition.components.schemas = this.schemas;
    return this.swaggerDefinition;
  }

  /**
   * Extrai parâmetros de path da rota
   */
  private extractPathParameters(path: string): any[] {
    const parameters: any[] = [];
    const paramMatches = path.match(/:(\w+)/g);

    if (paramMatches) {
      for (const match of paramMatches) {
        const paramName = match.substring(1); // Remove o ":"
        parameters.push({
          name: paramName,
          in: "path",
          required: true,
          schema: { type: "string" },
          description: `ID do ${paramName}`,
        });
      }
    }

    return parameters;
  }

  /**
   * Processa query parameters dos decorators @ApiQuery
   */
  private processQueryParameters(queries: any[]): any[] {
    return queries.map((query) => ({
      name: query.name,
      in: "query",
      required: query.required || false,
      schema: {
        type: query.type || "string",
        minimum: query.minimum,
        maximum: query.maximum,
        default: query.default,
      },
      description: query.description || `Query parameter ${query.name}`,
      example: query.example,
    }));
  }

  /**
   * Coleta metadata dos controllers registrados
   */
  private collectRouteMetadata(): void {
    // Importar dependências necessárias
    const { container } = require("../common/container");
    const { TYPES } = require("../common/types");
    const { getRouteMetadata, getControllerPrefix } = require("../common/decorators/route.decorators");
    const { getRouteAccess, RouteAccessType } = require("../modules/auth/decorators/access.decorators");

    // Mapeamento dos controllers disponíveis
    const CONTROLLERS = {
      AuthController: TYPES.AuthController,
      UsersController: TYPES.UsersController,
      CategoriesController: TYPES.CategoriesController,
      RecipesController: TYPES.RecipesController,
    };

    for (const [controllerName, controllerType] of Object.entries(CONTROLLERS)) {
      try {
        // Obtém o controller do container
        const controller = container.get(controllerType as any) as any;
        const controllerClass = controller.constructor;

        // Obtém o prefixo do controller
        const controllerPrefix = getControllerPrefix(controllerClass);

        // Obtém os metadados das rotas
        const routes = getRouteMetadata(controllerClass);

        if (routes.length === 0) {
          console.warn(`No routes found for ${controllerName}`);
          continue;
        }

        // Processa cada rota
        for (const route of routes) {
          const fullPath = `${controllerPrefix}${route.path}`;
          // Converte parâmetros do formato :id para {id} (formato OpenAPI)
          const swaggerPath = fullPath.replace(/:(\w+)/g, "{$1}");
          const method = route.method.toLowerCase();

          // Obtém informações de acesso da rota
          const accessType = getRouteAccess(controller, route.methodName);

          // Obtém metadata do Swagger para o método
          const metadata = getMethodMetadata(controller, route.methodName);

          // Cria entrada no paths do Swagger
          if (!this.swaggerDefinition.paths[swaggerPath]) {
            this.swaggerDefinition.paths[swaggerPath] = {};
          }

          const pathItem: any = {
            tags: metadata.tags.length > 0 ? metadata.tags : [controllerName.replace("Controller", "")],
            summary: metadata.operation?.summary || `${route.method.toUpperCase()} ${swaggerPath}`,
            description: metadata.operation?.description || "",
            responses: this.processResponses(metadata.responses),
          };

          // Adicionar requestBody se houver
          if (metadata.body) {
            pathItem.requestBody = this.processRequestBody(metadata.body);
          }

          // Inicializar array de parâmetros
          const parameters: any[] = [];

          // Adicionar parâmetros de path
          if (route.path.includes(":")) {
            parameters.push(...this.extractPathParameters(route.path));
          }

          // Adicionar query parameters
          if (metadata.queries && metadata.queries.length > 0) {
            parameters.push(...this.processQueryParameters(metadata.queries));
          }

          // Adicionar parâmetros se houver
          if (parameters.length > 0) {
            pathItem.parameters = parameters;
          }

          // Adicionar segurança se não for rota pública
          if (accessType !== RouteAccessType.PUBLIC) {
            pathItem.security = [{ BearerAuth: [] }];
          }

          this.swaggerDefinition.paths[swaggerPath][method] = pathItem;
        }
      } catch (error) {
        console.warn(`Não foi possível processar ${controllerName}:`, error);
      }
    }
  }

  /**
   * Processa as respostas do método
   */
  private processResponses(responses: any[]): any {
    const processedResponses: any = {};

    if (responses.length === 0) {
      processedResponses["200"] = {
        description: "Sucesso",
        content: {
          "application/json": {
            schema: { type: "object" },
          },
        },
      };
    }

    for (const response of responses) {
      let schema = response.schema;

      if (response.type && !schema) {
        try {
          schema = getSchemaFromDto(response.type);
          this.addSchemaToComponents(response.type.name, schema);
          schema = { $ref: `#/components/schemas/${response.type.name}` };
        } catch (error) {
          schema = { type: "object" };
        }
      }

      processedResponses[response.status.toString()] = {
        description: response.description || "Resposta",
        content: {
          "application/json": {
            schema: schema || { type: "object" },
          },
        },
      };
    }

    return processedResponses;
  }

  /**
   * Processa o corpo da requisição
   */
  private processRequestBody(body: any): any {
    let schema = body.schema;

    if (body.type && !schema) {
      try {
        schema = getSchemaFromDto(body.type);
        this.addSchemaToComponents(body.type.name, schema);
        schema = { $ref: `#/components/schemas/${body.type.name}` };
      } catch (error) {
        schema = { type: "object" };
      }
    }

    return {
      description: body.description || "Dados da requisição",
      required: body.required !== false,
      content: {
        "application/json": {
          schema: schema || { type: "object" },
        },
      },
    };
  }

  /**
   * Adiciona schema aos componentes
   */
  private addSchemaToComponents(name: string, schema: any): void {
    this.schemas[name] = schema;
  }
}

/**
 * Configura Swagger UI personalizado no Fastify
 */
export async function setupCustomSwagger(app: FastifyInstance): Promise<void> {
  const swaggerService = new CustomSwaggerService();
  const swaggerSpec = swaggerService.generateSwaggerFromControllers();

  // Registrar rota para servir a documentação JSON
  app.get("/docs/swagger.json", async (request, reply) => {
    reply.type("application/json").send(swaggerSpec);
  });

  // Registrar rota para servir o Swagger UI usando CDN
  app.get("/docs", async (request, reply) => {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>API - Doc</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
  <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@5.9.0/favicon-32x32.png" sizes="32x32" />
  <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@5.9.0/favicon-16x16.png" sizes="16x16" />
  <style>
    html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin:0; background: #fafafa; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      // Detectar automaticamente o servidor baseado no host atual
      const currentHost = window.location.host;
      const currentProtocol = window.location.protocol;
      const apiPrefix = '${process.env.SERVER_PREFIX || "/api"}';
      
      // Configurar o servidor baseado no host atual
      const currentServerUrl = currentProtocol + '//' + currentHost + apiPrefix;
      
      const ui = SwaggerUIBundle({
        url: './docs/swagger.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        // Configurar o servidor automaticamente
        onComplete: function() {
          // Definir o servidor atual como padrão
          ui.preauthorizeApiKey('server', currentServerUrl);
        },
        // Interceptar requisições para usar o host atual
        requestInterceptor: function(request) {
          // Se a URL contiver localhost ou for relativa, substituir pelo host atual
          if (request.url.includes('localhost')) {
            // Extrair apenas o path depois de /api
            const apiIndex = request.url.indexOf('/api');
            if (apiIndex !== -1) {
              const path = request.url.substring(apiIndex);
              request.url = currentServerUrl + path.replace('/api', '');
            }
          } else if (!request.url.includes('://')) {
            // URL relativa
            let path = request.url;
            if (path.startsWith('./')) {
              path = path.substring(1); // Remove o '.'
            }
            if (!path.startsWith('/')) {
              path = '/' + path;
            }
            request.url = currentServerUrl + path;
          }
          return request;
        }
      });
      
      console.log('🎯 Swagger configurado para usar servidor:', currentServerUrl);
    };
  </script>
</body>
</html>`;
    reply.type("text/html").send(html);
  });

  const apiPrefix = process.env.SERVER_PREFIX || "/api";
  const port = Number(process.env.PORT) || 3001;

  const { local, network } = getNetworkInfo(port, `${apiPrefix}/docs`);

  console.log(`📖 Custom Swagger ready at:`);
  console.log(`   Local:   ${local}`);

  if (network.length > 0) {
    network.forEach((addr) => {
      console.log(`   Network: ${addr}`);
    });
  }
}
