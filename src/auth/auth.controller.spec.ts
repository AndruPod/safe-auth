// import { Test } from '@nestjs/testing';
// import { AuthController } from './auth.controller';
// import { AuthService } from './auth.service';
//
// describe('AuthController', () => {
//     let controller: AuthController;
//
//     const mockAuthService = {
//         signUp: jest.fn(),
//         login: jest.fn(),
//         refresh: jest.fn(),
//         logout: jest.fn(),
//         getUser: jest.fn(),
//     };
//
//     beforeEach(async () => {
//         const module = await Test.createTestingModule({
//             controllers: [AuthController],
//             providers: [{ provide: AuthService, useValue: mockAuthService }],
//         }).compile();
//
//         controller = module.get(AuthController);
//     });
//
//     it('should call signUp', async () => {
//         await controller.signUp({} as any);
//         expect(mockAuthService.signUp).toHaveBeenCalled();
//     });
//
//     it('should call login', async () => {
//         await controller.login({} as any);
//         expect(mockAuthService.login).toHaveBeenCalled();
//     });
//
//     it('should call refresh', async () => {
//         await controller.refresh(1, 'token');
//         expect(mockAuthService.refresh).toHaveBeenCalledWith(1, 'token');
//     });
//
//     it('should call logout', async () => {
//         await controller.logout('token');
//         expect(mockAuthService.logout).toHaveBeenCalled();
//     });
//
//     it('should call getUser', async () => {
//         await controller.getUser('Bearer token');
//         expect(mockAuthService.getUser).toHaveBeenCalled();
//     });
//
//     it('should return result of signUp', async () => {
//         const mocked = { id: 1, email: 'a@test.com' };
//         mockAuthService.signUp.mockResolvedValue(mocked);
//
//         const result = await controller.signUp({} as any);
//         expect(result).toEqual(mocked);
//     });
//
//     it('should return result of login', async () => {
//         const mocked = { access_token: 'abc', refresh_token: 'xyz' };
//         mockAuthService.login.mockResolvedValue(mocked);
//
//         const result = await controller.login({} as any);
//         expect(result).toEqual(mocked);
//     });
//
//     it('should return result of refresh', async () => {
//         const mocked = { access_token: 'abc', refresh_token: 'xyz' };
//         mockAuthService.refresh.mockResolvedValue(mocked);
//
//         const result = await controller.refresh(1, 'token');
//         expect(result).toEqual(mocked);
//     });
//
//     it('should return result of logout', async () => {
//         const mocked = { message: 'Logged out' };
//         mockAuthService.logout.mockResolvedValue(mocked);
//
//         const result = await controller.logout('token');
//         expect(result).toEqual(mocked);
//     });
//
//     it('should return result of getUser', async () => {
//         const mocked = { id: 1, email: 'a@test.com' };
//         mockAuthService.getUser.mockResolvedValue(mocked);
//
//         const result = await controller.getUser('Bearer token');
//         expect(result).toEqual(mocked);
//     });
//
// });
//

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
