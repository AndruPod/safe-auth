import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { UsersModule } from '../src/users/users.module';
import { UsersService } from '../src/users/users.service';

describe('UsersController (e2e)', () => {
    let app: INestApplication;
    const usersServiceMock = {
        create: jest.fn(),
        findOneById: jest.fn(),
        findOneByEmail: jest.fn(),
    };

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [UsersModule],
        })
            .overrideProvider(UsersService)
            .useValue(usersServiceMock)
            .compile();

        app = moduleRef.createNestApplication();
        await app.init();
    });

    it('/users/create (POST)', () => {
        usersServiceMock.create.mockResolvedValue({ id: 1, email: 'a@b.com' });
        return request(app.getHttpServer())
            .post('/users/create')
            .send({ email: 'a@b.com', password: '123' })
            .expect(201)
            .expect({ id: 1, email: 'a@b.com' });
    });

    it('/users/get-by-id/:id (GET)', () => {
        usersServiceMock.findOneById.mockResolvedValue({ id: 1, email: 'a@b.com' });
        return request(app.getHttpServer())
            .get('/users/get-by-id/1')
            .expect(200)
            .expect({ id: 1, email: 'a@b.com' });
    });

    afterAll(async () => {
        await app.close();
    });
});
