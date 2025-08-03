import { connectDatabase } from "./app/database.service";
import { createFastifyApp, startServer } from "./app/fastify.service";
import { setupSwagger } from "./app/swagger.service";

async function bootstrap() {
  await connectDatabase();

  const app = await createFastifyApp();

  await setupSwagger(app);

  await startServer(app);
}

bootstrap().catch(console.error);
