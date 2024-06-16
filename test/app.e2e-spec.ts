import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET) should redirect to /movies', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(302)
      .expect('Location', '/movies');
  });

  it('/health (GET) should return status ok and a timestamp', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.objectContaining({
            status: 'ok',
            timestamp: expect.any(String),
          }),
        );
      });
  });
});
