import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
    hash: jest.fn(),
    compare: jest.fn(),
}));

describe('AuthService', () => {
    let service: AuthService;
    let mockUsersService: any;
    let mockJwtService: any;
    let mockRedis: any;

    beforeEach(async () => {
        mockUsersService = {
            findOneByEmail: jest.fn(),
            findOneById: jest.fn(),
            create: jest.fn(),
        };

        mockJwtService = {
            signAsync: jest.fn().mockResolvedValue('mocked_token'),
            verifyAsync: jest.fn(),
            verify: jest.fn(),
        };

        mockRedis = {
            set: jest.fn(),
            get: jest.fn(),
            del: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: UsersService, useValue: mockUsersService },
                { provide: JwtService, useValue: mockJwtService },
                { provide: 'REDIS', useValue: mockRedis },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);

        jest.clearAllMocks();
        (bcrypt.hash as jest.Mock).mockReset();
        (bcrypt.compare as jest.Mock).mockReset();
    });

    it('should sign up successfully', async () => {
        mockUsersService.findOneByEmail.mockResolvedValue(null);
        mockUsersService.create.mockResolvedValue({ id: 1, email: 'a@test.com' });

        const result = await service.signUp({
            email: 'a@test.com',
            password: '123456',
            confirmedPassword: '123456',
        });

        expect(result.email).toBe('a@test.com');
    });

    it('should throw if missing fields', async () => {
        await expect(service.signUp({ email: '', password: '', confirmedPassword: '' }))
            .rejects.toThrow(BadRequestException);
    });

    it('should throw if passwords mismatch', async () => {
        await expect(service.signUp({
            email: 'a@test.com', password: '123', confirmedPassword: '321'
        })).rejects.toThrow(BadRequestException);
    });

    it('should throw if user already exists', async () => {
        mockUsersService.findOneByEmail.mockResolvedValue({ id: 1 });
        await expect(service.signUp({
            email: 'a@test.com', password: '123', confirmedPassword: '123'
        })).rejects.toThrow(BadRequestException);
    });

    it('should throw if create fails', async () => {
        mockUsersService.findOneByEmail.mockResolvedValue(null);
        mockUsersService.create.mockRejectedValue(new Error('DB fail'));
        await expect(service.signUp({ email: 'fail@test.com', password: '123', confirmedPassword: '123' }))
            .rejects.toThrow();
    });

    it('should login successfully', async () => {
        const hashed = await bcrypt.hash('123456', 10);
        mockUsersService.findOneByEmail.mockResolvedValue({ id: 1, email: 'a@test.com', password: hashed });
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);

        const result = await service.login({ email: 'a@test.com', password: '123456' });
        expect(result).toHaveProperty('access_token');
        expect(result).toHaveProperty('refresh_token');
    });

    it('should throw if user not found on login', async () => {
        mockUsersService.findOneByEmail.mockResolvedValue(null);
        await expect(service.login({ email: 'wrong@test.com', password: '123' }))
            .rejects.toThrow(UnauthorizedException);
    });

    it('should throw if password mismatch on login', async () => {
        const hashed = await bcrypt.hash('123456', 10);
        mockUsersService.findOneByEmail.mockResolvedValue({ id: 1, email: 'a@test.com', password: hashed });
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);

        await expect(service.login({ email: 'a@test.com', password: 'wrong' }))
            .rejects.toThrow(UnauthorizedException);
    });

    it('should refresh successfully', async () => {
        mockJwtService.verifyAsync.mockResolvedValue({ id: 1 });
        (mockRedis.get as jest.Mock).mockResolvedValue('hashed_refresh');
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        mockUsersService.findOneById.mockResolvedValue({ id: 1, email: 'a@test.com' });

        const result = await service.refresh(1, 'refresh_token');
        expect(result).toHaveProperty('access_token');
        expect(result).toHaveProperty('refresh_token');
        expect(mockRedis.del).toHaveBeenCalledWith(`refresh:1`);
    });

    it('should throw if no stored refresh token', async () => {
        mockJwtService.verifyAsync.mockResolvedValue({ id: 1 });
        (mockRedis.get as jest.Mock).mockResolvedValue(null);

        await expect(service.refresh(1, 'token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if refresh mismatch', async () => {
        mockJwtService.verifyAsync.mockResolvedValue({ id: 1 });
        (mockRedis.get as jest.Mock).mockResolvedValue('hashed_refresh');
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);

        await expect(service.refresh(1, 'token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if user not found during refresh', async () => {
        mockJwtService.verifyAsync.mockResolvedValue({ id: 1 });
        (mockRedis.get as jest.Mock).mockResolvedValue('hashed_refresh');
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        mockUsersService.findOneById.mockResolvedValue(null);

        await expect(service.refresh(1, 'token')).rejects.toThrow(UnauthorizedException);
    });

    it('should return user if token valid', async () => {
        mockJwtService.verify.mockReturnValue({ id: 1 });
        mockUsersService.findOneById.mockResolvedValue({ id: 1, email: 'a@test.com' });

        const user = await service.getUser('token');
        expect(user.email).toBe('a@test.com');
    });

    it('should throw if token invalid', async () => {
        mockJwtService.verify.mockImplementation(() => { throw new Error(); });
        await expect(service.getUser('bad')).rejects.toThrow(UnauthorizedException);
    });

    it('should logout successfully', async () => {
        mockJwtService.verifyAsync.mockResolvedValue({ id: 1 });
        const result = await service.logout('refresh_token');
        expect(mockRedis.del).toHaveBeenCalledWith('refresh:1');
        expect(result).toEqual({ message: 'Logged out' });
    });

    it('should throw if logout token invalid', async () => {
        mockJwtService.verifyAsync.mockRejectedValue(new Error());
        await expect(service.logout('bad')).rejects.toThrow(UnauthorizedException);
    });

    it('should save refresh token', async () => {
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_refresh');
        await (service as any).saveRefreshToken(1, 'refresh_token');
        expect(mockRedis.set).toHaveBeenCalledWith(
            'refresh:1',
            'hashed_refresh',
            'EX',
            7 * 24 * 60 * 60
        );
    });

    it('should generate tokens', async () => {
        const result = await (service as any).generateTokens(1, 'a@test.com');
        expect(result).toHaveProperty('access_token');
        expect(result).toHaveProperty('refresh_token');
    });
});
