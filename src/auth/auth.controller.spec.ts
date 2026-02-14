import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
    let controller: AuthController;

    const mockAuthService = {
        signUp: jest.fn(),
        login: jest.fn(),
        refresh: jest.fn(),
        logout: jest.fn(),
        getUser: jest.fn(),
    };

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [{ provide: AuthService, useValue: mockAuthService }],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        jest.clearAllMocks();
    });

    it('should call signUp', async () => {
        await controller.signUp({} as any);
        expect(mockAuthService.signUp).toHaveBeenCalled();
    });

    it('should call login', async () => {
        await controller.login({} as any);
        expect(mockAuthService.login).toHaveBeenCalled();
    });

    it('should call refresh', async () => {
        await controller.refresh(1, 'token');
        expect(mockAuthService.refresh).toHaveBeenCalledWith(1, 'token');
    });

    it('should call logout', async () => {
        await controller.logout('token');
        expect(mockAuthService.logout).toHaveBeenCalledWith('token');
    });

    it('should call getUser', async () => {
        await controller.getUser('Bearer token');
        expect(mockAuthService.getUser).toHaveBeenCalledWith('token');
    });
});
