import "reflect-metadata";
import dotenv from "dotenv";
import { connectDatabase } from "./app/database.service";
import { createFastifyApp, startServer } from "./app/fastify.service";

// Carrega as variáveis de ambiente
dotenv.config();

async function bootstrap() {
	await connectDatabase();

	const app = await createFastifyApp();

	await startServer(app);
}

bootstrap().catch(console.error);
