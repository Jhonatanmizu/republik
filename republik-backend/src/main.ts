import { resolve } from 'node:path';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import express from 'express';
import { AppModule, ObserveInstrument } from './app.module.js';
import { getEnvConfig } from './config/env.config.js';

async function bootstrap() {
  const env = getEnvConfig();
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    instrument: ObserveInstrument,
  });

  app.use(express.json({ limit: env.BODY_LIMIT }));
  app.use(express.urlencoded({ extended: true, limit: env.BODY_LIMIT }));

  const uploadsDir = resolve(env.LOCAL_STORAGE_PATH);
  app.use('/uploads', express.static(uploadsDir));

  const allowedOrigins = Array.from(
    new Set([
      env.FRONTEND_ORIGIN,
      ...env.CORS_ALLOWED_ORIGINS.split(',')
        .map((o) => o.trim())
        .filter(Boolean),
    ]),
  );

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-CSRF-Token',
      'x-csrf-token',
    ],
  });

  app.setGlobalPrefix(env.API_PREFIX);

  await app.listen(env.PORT);
}
await bootstrap();
