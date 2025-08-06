import { FastifyInstance } from "fastify";
import cors from "@fastify/cors";

/**
 * Configuração do CORS baseada em variáveis de ambiente
 */
export interface CorsConfig {
  origin: string | string[] | boolean;
  credentials: boolean;
}

/**
 * Obtém a configuração do CORS das variáveis de ambiente
 */
function getCorsConfig(): CorsConfig {
  const corsOrigin = process.env.CORS_ORIGIN || "*";
  const corsCredentials = process.env.CORS_CREDENTIALS === "true";

  let origin: string | string[] | boolean;

  if (corsOrigin === "*") {
    // Se for *, aceita qualquer origem
    origin = true;
  } else if (corsOrigin.includes(",")) {
    // Se contém vírgula, é uma lista de origens
    origin = corsOrigin.split(",").map((o) => o.trim());
  } else {
    // Uma única origem
    origin = corsOrigin;
  }

  return {
    origin,
    credentials: corsCredentials,
  };
}

/**
 * Registra o middleware de CORS no Fastify
 */
export async function setupCors(app: FastifyInstance): Promise<void> {
  const config = getCorsConfig();

  await app.register(cors, {
    origin: config.origin,
    credentials: config.credentials,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  });

  console.log("🌐 CORS configured with:");
  console.log(`   Origin: ${JSON.stringify(config.origin)}`);
  console.log(`   Credentials: ${config.credentials}`);
}
