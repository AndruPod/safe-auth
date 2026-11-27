import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

// Needs real PostgreSQL (migrated) and Redis, configured through env variables
describe('Auth flow (e2e)', () => {
    let app: INestApplication;
    const email = `e2e-${Date.now()}@example.com`;
    const password = 'test-password-123';

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
        app = moduleRef.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
        await app.init();
    });

    afterAll(async () => {
        await app.get<any>('REDIS', { strict: false }).quit();
        await app.get<any>('DRIZZLE', { strict: false }).$client.end();
        await app.close();
    });

    const post = (url: string, body: object) => request(app.getHttpServer()).post(url).send(body);

    it('rotates refresh tokens and never exposes password hashes', async () => {
        const signUp = await post('/auth/sign-up', { email, password, confirmedPassword: password }).expect(201);
        expect(signUp.body).not.toHaveProperty('password');

        const login = await post('/auth/login', { email, password }).expect(201);
        const first = login.body.refresh_token;

        const profile = await request(app.getHttpServer())
            .get('/auth')
            .set('Authorization', `Bearer ${login.body.access_token}`)
            .expect(200);
        expect(profile.body).not.toHaveProperty('password');

        const rotated = await post('/auth/refresh', { refresh: first }).expect(201);
        await post('/auth/refresh', { refresh: first }).expect(401);
        await post('/auth/logout', { refresh: first }).expect(401);

        const second = rotated.body.refresh_token;
        await post('/auth/logout', { refresh: second }).expect(201);
        await post('/auth/refresh', { refresh: second }).expect(401);
    });

    it('has no public user lookup routes', async () => {
        await request(app.getHttpServer()).get('/users/get-by-id/1').expect(404);
        await request(app.getHttpServer()).get(`/users/get-by-email?email=${email}`).expect(404);
    });
});
