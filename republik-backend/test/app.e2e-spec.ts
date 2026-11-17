import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

describe('Republik API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api (GET) returns Hello World with security headers and CSRF cookie', async () => {
    const res = await request(app.getHttpServer()).get('/api').expect(200);
    expect(res.text).toBe('Hello World!');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBe('DENY');
  });

  it('/api/universities (GET) returns seeded Brazilian universities', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/universities')
      .expect(200);
    const body = res.body as { universities: Array<{ code: string }> };
    expect(Array.isArray(body.universities)).toBe(true);
    expect(body.universities.some((u) => u.code === 'USP')).toBe(true);
    expect(body.universities.some((u) => u.code === 'UEFS')).toBe(true);
  });

  it('/api/listings (GET) supports Full-Text Search for housing and marketplace', async () => {
    const housingRes = await request(app.getHttpServer())
      .get('/api/listings?type=HOUSING&q=Butant%C3%A3')
      .expect(200);
    const housingBody = housingRes.body as {
      listings: Array<{ title: string }>;
    };
    expect(housingBody.listings.length).toBeGreaterThan(0);

    const marketRes = await request(app.getHttpServer())
      .get('/api/listings?type=MARKETPLACE&q=Escrivaninha')
      .expect(200);
    const marketBody = marketRes.body as {
      listings: Array<{ title: string }>;
    };
    expect(marketBody.listings.length).toBeGreaterThan(0);
  });
});
