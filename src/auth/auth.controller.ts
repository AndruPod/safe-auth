import {
    Controller,
    Get,
    Post,
    Body,
    Query,
    Headers
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('sign-up')
    signUp(@Body() signUpDto: SignUpDto) {
        return this.authService.signUp(signUpDto);
    }

    @Post('login')
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Get()
    getUser(@Headers('authorization') auth: string) {
        const token = auth?.replace('Bearer ', '');
        return this.authService.getUser(token);
    }

    @Post('refresh')
    refresh(
        @Query('userId') userId: number,
        @Body('refresh') refreshToken: string,
    ) {
        return this.authService.refresh(Number(userId), refreshToken);
    }

    @Post('logout')
    logout(@Body('refresh') refreshToken: string,) {
        return this.authService.logout(refreshToken);
    }
}
