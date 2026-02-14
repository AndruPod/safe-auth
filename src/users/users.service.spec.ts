import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { BadRequestException } from '@nestjs/common';

describe('UsersService', () => {
    let service: UsersService;

    const mockDb = {
        insert: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        returning: jest.fn(),
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                { provide: 'DRIZZLE', useValue: mockDb },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        jest.clearAllMocks();
    });

    it('should create user', async () => {
        mockDb.returning.mockResolvedValue([{ id: 1, email: 'a@test.com' }]);
        const result = await service.create({ email: 'a@test.com', password: '123' });
        expect(result.email).toBe('a@test.com');
    });

    it('should throw if create fails', async () => {
        mockDb.returning.mockRejectedValue(new Error('fail'));
        await expect(service.create({ email: 'fail@test.com', password: '123' }))
            .rejects.toThrow(BadRequestException);
    });

    it('should find user by id', async () => {
        mockDb.where.mockResolvedValue([{ id: 1 }]);
        const user = await service.findOneById(1);
        expect(user.id).toBe(1);
    });

    it('should return undefined if user not found by id', async () => {
        mockDb.where.mockResolvedValue([]);
        const user = await service.findOneById(999);
        expect(user).toBeUndefined();
    });

    it('should find user by email', async () => {
        mockDb.where.mockResolvedValue([{ id: 1, email: 'a@test.com' }]);
        const user = await service.findOneByEmail('a@test.com');
        expect(user.email).toBe('a@test.com');
    });

    it('should return undefined if user not found by email', async () => {
        mockDb.where.mockResolvedValue([]);
        const user = await service.findOneByEmail('none@test.com');
        expect(user).toBeUndefined();
    });
});
