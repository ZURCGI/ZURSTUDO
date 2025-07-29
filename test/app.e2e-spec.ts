import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';

describe('E2E API Coverage', () => {
  let app: INestApplication;
  let agent: request.SuperAgentTest;
  let adminCookie: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    agent = request.agent(app.getHttpServer());
    // 登入取得 admin cookie
    const loginRes = await agent
      .post('/auth/login')
      .send({ username: 'admin', password: 'admin123' });
    adminCookie = loginRes.headers['set-cookie']?.[0];
  });

  afterAll(async () => {
    await app.close();
  });

  // Auth
  it('/auth/login (POST) - success', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'admin', password: 'admin123' })
      .expect(201);
    expect(res.body).toHaveProperty('access_token');
    expect(res.headers['set-cookie']).toBeDefined();
  });
  it('/auth/me (GET) - with cookie', async () => {
    const res = await agent.get('/auth/me').set('Cookie', adminCookie).expect(200);
    expect(res.body).toHaveProperty('username');
  });
  it('/auth/me (GET) - unauthorized', async () => {
    await request(app.getHttpServer()).get('/auth/me').expect(401);
  });
  it('/auth/logout (POST) - with cookie', async () => {
    await agent.post('/auth/logout').set('Cookie', adminCookie).expect(201);
  });

  // Users
  it('/users/create-admin (POST) - unauthorized', async () => {
    await request(app.getHttpServer())
      .post('/users/create-admin')
      .send({ username: 'testadmin', password: 'test1234' })
      .expect(401);
  });
  // Media
  it('/media/health (GET)', async () => {
    const res = await request(app.getHttpServer()).get('/media/health').expect(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });
  it('/media/list (GET) - with cookie', async () => {
    await agent.get('/media/list').set('Cookie', adminCookie).expect(200);
  });
  it('/media/list (GET) - unauthorized', async () => {
    await request(app.getHttpServer()).get('/media/list').expect(401);
  });
  // Settings
  it('/settings (GET) - with cookie', async () => {
    await agent.get('/settings').set('Cookie', adminCookie).expect(200);
  });
  it('/settings (GET) - unauthorized', async () => {
    await request(app.getHttpServer()).get('/settings').expect(401);
  });
  // Analytics
  it('/analytics/dashboard (GET) - with cookie', async () => {
    await agent.get('/analytics/dashboard').set('Cookie', adminCookie).expect(200);
  });
  it('/analytics/dashboard (GET) - unauthorized', async () => {
    await request(app.getHttpServer()).get('/analytics/dashboard').expect(401);
  });
  
  // Projects - Comprehensive CRUD Tests
  it('/projects (GET)', async () => {
    await request(app.getHttpServer()).get('/projects').expect(200);
  });
  
  it('/projects (POST) - create project with SEO/AEO/GEO', async () => {
    const projectData = {
      name: 'Test Project',
      seoTitle: 'Test SEO Title',
      seoDescription: 'Test SEO Description',
      seoKeywords: 'test,seo,keywords',
      ogImage: 'https://example.com/og-image.jpg',
      faqList: [
        { question: 'Test Question 1?', answer: 'Test Answer 1' },
        { question: 'Test Question 2?', answer: 'Test Answer 2' }
      ],
      address: 'Test Address',
      lat: 25.033,
      lng: 121.5654,
      city: 'Test City',
      zipcode: '110'
    };
    
    const res = await request(app.getHttpServer())
      .post('/projects')
      .send(projectData)
      .expect(201);
    
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe(projectData.name);
    expect(res.body.seoTitle).toBe(projectData.seoTitle);
    expect(res.body.faqList).toHaveLength(2);
    expect(res.body.address).toBe(projectData.address);
  });
  
  it('/projects/:id (GET) - get single project', async () => {
    // First create a project
    const createRes = await request(app.getHttpServer())
      .post('/projects')
      .send({ name: 'Test Project for Get' })
      .expect(201);
    
    const projectId = createRes.body.id;
    
    // Then get the project
    const getRes = await request(app.getHttpServer())
      .get(`/projects/${projectId}`)
      .expect(200);
    
    expect(getRes.body).toHaveProperty('id', projectId);
    expect(getRes.body.name).toBe('Test Project for Get');
  });
  
  it('/projects/:id (PUT) - update project', async () => {
    // First create a project
    const createRes = await request(app.getHttpServer())
      .post('/projects')
      .send({ name: 'Test Project for Update' })
      .expect(201);
    
    const projectId = createRes.body.id;
    
    // Then update the project
    const updateData = {
      seoTitle: 'Updated SEO Title',
      seoDescription: 'Updated SEO Description',
      faqList: [{ question: 'Updated Question?', answer: 'Updated Answer' }]
    };
    
    const updateRes = await request(app.getHttpServer())
      .put(`/projects/${projectId}`)
      .send(updateData)
      .expect(200);
    
    expect(updateRes.body.seoTitle).toBe(updateData.seoTitle);
    expect(updateRes.body.faqList).toHaveLength(1);
  });
  
  it('/projects/:name (DELETE) - delete project', async () => {
    // First create a project
    const createRes = await request(app.getHttpServer())
      .post('/projects')
      .send({ name: 'Test Project for Delete' })
      .expect(201);
    
    // Then delete the project
    await request(app.getHttpServer())
      .delete('/projects/Test Project for Delete')
      .expect(200);
  });
  
  // Upload callback
  it('/upload/callback (POST) - unauthorized', async () => {
    await request(app.getHttpServer())
      .post('/upload/callback')
      .send({})
      .expect(401);
  });
}); 