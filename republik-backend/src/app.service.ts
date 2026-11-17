import { Injectable } from '@nestjs/common';

export const APP_GREETING = 'Hello World!' as const;

@Injectable()
export class AppService {
  getHello(): string {
    return APP_GREETING;
  }

  getHealthStatus() {
    return {
      status: 'ok',
      service: 'republik-backend',
      timestamp: new Date().toISOString(),
    };
  }
}
