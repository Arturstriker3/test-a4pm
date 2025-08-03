import Fastify from "fastify";
import os from "os";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

const port = Number(process.env.PORT) || 3001;
const app = Fastify();

app.get("/", async (request, reply) => {
  return { status: "API is running!" };
});

app.listen({ port, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  if (process.env.TSX_HOT) {
    console.log("🔄 Server reloaded by hot reload (tsx)");
  }
  const local = `http://localhost:${port}`;
  const nets = os.networkInterfaces();
  const ips: string[] = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]!) {
      if (net.family === "IPv4" && !net.internal) {
        ips.push(`http://${net.address}:${port}`);
      }
    }
  }
  console.log("Server listening at:");
  console.log(`  Local:   ${local}`);
  ips.forEach((ip) => console.log(`  Network: ${ip}`));
});
