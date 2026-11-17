import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { createObserveModule } from '@nestjs/observe';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { getEnvConfig } from './config/env.config.js';
import { APP_CONSTANTS } from './constants/app.constants.js';
import { DatabaseModule } from './database/database.module.js';
import { AdminModule } from './modules/admin/admin.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { ChatModule } from './modules/chat/chat.module.js';
import { ListingsModule } from './modules/listings/listings.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { MailModule } from './shared/mail/mail.module.js';
import {
  CsrfGuard,
  SecurityHeadersMiddleware,
} from './shared/security/security.js';
import { StorageModule } from './shared/storage/storage.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

const env = getEnvConfig();

@Module({
  imports: [
    ObserveModule.forRoot({
      appKey: env.OBSERVE_APP_KEY,
      appSecret: env.OBSERVE_APP_SECRET,
      serviceId: env.OBSERVE_SERVICE_ID,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: APP_CONSTANTS.THROTTLE.DEFAULT_TTL_MS,
        limit: APP_CONSTANTS.THROTTLE.DEFAULT_LIMIT,
      },
    ]),
    DatabaseModule,
    MailModule,
    StorageModule,
    AuthModule,
    UsersModule,
    ListingsModule,
    ChatModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CsrfGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(SecurityHeadersMiddleware)
      .forRoutes({ path: '*path', method: RequestMethod.ALL });
  }
}
