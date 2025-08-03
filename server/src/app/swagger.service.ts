import { FastifyInstance } from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";

export async function setupSwagger(app: FastifyInstance): Promise<void> {
  const apiPrefix = process.env.SERVER_PREFIX || "/api";
  const port = Number(process.env.PORT) || 3001;
  const apiName = process.env.API_NAME || "API Fastify";

  // Registrar plugin do Swagger
  await app.register(fastifySwagger, {
    swagger: {
      info: {
        title: apiName,
        description: `${apiName} - API Documentation`,
        version: "1.0.0",
      },
      host: `localhost:${port}`,
      schemes: ["http"],
      consumes: ["application/json"],
      produces: ["application/json"],
      securityDefinitions: {
        BearerAuth: {
          type: "apiKey",
          name: "Authorization",
          in: "header",
        },
      },
    },
  });

  // Registrar plugin da UI do Swagger
  await app.register(fastifySwaggerUI, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: false,
    },
    staticCSP: true,
  });

  // Obter informações de rede para mostrar URLs
  const { local, network } = getNetworkInfo(port, apiPrefix);
  const docsPrefix = `${apiPrefix}/docs`;

  console.log(`📖 Swagger ready at:`);
  console.log(`   Local:   ${local.replace(apiPrefix, docsPrefix)}`);

  if (network.length > 0) {
    network.forEach((addr) => {
      console.log(`   Network: ${addr.replace(apiPrefix, docsPrefix)}`);
    });
  }
}

function getNetworkInfo(port: number, prefix: string = "") {
  const { networkInterfaces } = require("os");
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
