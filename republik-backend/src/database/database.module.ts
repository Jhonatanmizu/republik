import { Global, Inject, Module, OnApplicationShutdown } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { getEnvConfig } from '../config/env.config.js';
import { DRIZZLE_DB, PG_POOL } from './database.constants.js';
import { DatabaseInitService } from './database-init.service.js';
import * as schema from './schema.js';

@Global()
@Module({
  providers: [
    {
      provide: PG_POOL,
      useFactory: (): pg.Pool => {
        const env = getEnvConfig();
        return new pg.Pool({
          connectionString: env.DATABASE_URL,
          max: env.DB_POOL_MAX,
        });
      },
    },
    {
      provide: DRIZZLE_DB,
      inject: [PG_POOL],
      useFactory: (pool: pg.Pool) => drizzle(pool, { schema }),
    },
    DatabaseInitService,
  ],
  exports: [PG_POOL, DRIZZLE_DB, DatabaseInitService],
})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(@Inject(PG_POOL) private readonly pool: pg.Pool) {}

  async onApplicationShutdown(): Promise<void> {
    await this.pool.end();
  }
}
