import { app } from "./app";
import { config } from "./config";
import { runMigrations } from "./db/migrate";

async function start(): Promise<void> {
  if (config.runMigrations) {
    const applied = await runMigrations();
    if (applied.length) {
      console.log(`Applied migrations: ${applied.join(", ")}`);
    }
  }

  app.listen(config.port, () => {
    console.log(`CareHub API listening on http://localhost:${config.port}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});