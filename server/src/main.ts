import "reflect-metadata";
import { connectDatabase } from "./app/database.service";
import { createFastifyApp, startServer } from "./app/fastify.service";

async function bootstrap() {
	await connectDatabase();

	const app = await createFastifyApp();

	await startServer(app);
}

bootstrap().catch(console.error);
