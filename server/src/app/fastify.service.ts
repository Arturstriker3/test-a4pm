import Fastify, { FastifyInstance } from "fastify";
import { networkInterfaces } from "os";

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

export async function createFastifyApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: "warn",
    },
  });

  // Hook para customizar mensagens de erro de validação
  app.setErrorHandler((error, request, reply) => {
    // Se for erro de validação do schema (AJV)
    if (error.statusCode === 400 && error.validation) {
      const { ValidationException } = require("../common/exceptions");
      const { ApiResponse } = require("../common/responses");

      const cleanMessage = error.message.replace(/^body\//, "");
      const validationError = new ValidationException(cleanMessage);
      const response = validationError.toApiResponse();

      return reply.status(response.code).send({
        code: response.code,
        message: response.message,
        data: response.data,
      });
    }

    // Para outros erros, usa o handler padrão
    throw error;
  });

  const prefix = process.env.SERVER_PREFIX || "/api";
  await app.register(
    async function (fastify) {
      // Setup Swagger dentro do contexto com prefixo
      const { setupSwagger } = await import("./swagger.service");
      await setupSwagger(fastify);

      // Registrar rotas automaticamente usando decorators
      const { registerRoutes } = await import("./routes.service");
      await registerRoutes(fastify);
    },
    { prefix }
  );
  return app;
}

export async function startServer(app: FastifyInstance): Promise<void> {
  const port = Number(process.env.PORT) || 3000;
  const host = "0.0.0.0";
  const prefix = process.env.SERVER_PREFIX || "/api";

  try {
    await app.listen({ port, host });

    const { local, network } = getNetworkInfo(port, prefix);

    console.log(`🚀 Server running on:`);
    console.log(`   Local:   ${local}`);

    if (network.length > 0) {
      network.forEach((addr) => {
        console.log(`   Network: ${addr}`);
      });
    }
  } catch (err) {
    console.error(`❌ Failed to start server on port ${port}`);
    console.error(`❌ Error details:`, err);
    console.error(
      "💡 Try changing the PORT in your .env file or kill the process using this port"
    );
    process.exit(1);
  }
}
