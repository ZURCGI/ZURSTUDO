import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import * as path from 'path';

jest.setTimeout(20000);

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();

    // 登入取得 token
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'admin', password: 'Roguery@099' });
    expect(loginRes.status).toBe(201);
    const cookies = loginRes.headers['set-cookie'];
    let authToken: string;
    if (Array.isArray(cookies)) {
      const authCookie = cookies.find((c: string) =>
        c.startsWith('auth-token='),
      );
      authToken = authCookie || '';
    } else {
      authToken =
        typeof cookies === 'string' && cookies.startsWith('auth-token=')
          ? cookies
          : '';
    }
    expect(authToken).toBeDefined();
    token = authToken.split(';')[0].split('=')[1];
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('should return 400 if no file is provided', async () => {
    const res = await request(app.getHttpServer())
      .post('/media/upload-image')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  it('should upload an image file', async () => {
    const res = await request(app.getHttpServer())
      .post('/media/upload-image')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', path.join(__dirname, 'test.jpg'));
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('url');
    expect(res.body).toHaveProperty('publicId');
  });
});

// 其餘測試暫時註解
// describe('Media Upload (e2e)', () => { ... });
