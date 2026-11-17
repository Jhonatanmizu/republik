import { NestFactory } from '@nestjs/core';
import { DatabaseInitService } from './database-init.service.js';
import { DatabaseModule } from './database.module.js';

async function runSeedCli() {
  process.env.SKIP_DB_INIT = 'true';
  const app = await NestFactory.createApplicationContext(DatabaseModule);
  const initService = app.get(DatabaseInitService);
  await initService.ensureSchemaAndIndexes();
  await initService.seedIfEmpty();
  await app.close();
}

await runSeedCli();

