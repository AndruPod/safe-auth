import {
    BadRequestException,
    Inject,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import Redis from 'ioredis';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        @Inject('REDIS') private readonly redis: Redis
    ) {}

    async signUp(signUpDto: SignUpDto) {
        const { email, password, confirmedPassword } = signUpDto;

        if(!email || !password || !confirmedPassword)
            throw new BadRequestException("All data is required");

        const user = await this.usersService.findOneByEmail(email);

        if (user) throw new BadRequestException('User already exists');

        if (password !== confirmedPassword)
            throw new BadRequestException('Passwords do not match');

        return await this.usersService.create({ email, password });
    }

    async login(loginDto: LoginDto): Promise<{ access_token: string }> {

        if(!loginDto) {
            throw new BadRequestException('Data is required');
        }

        const { email, password } = loginDto;

        const user = await this.usersService.findOneByEmail(email);
        if (!user)
            throw new UnauthorizedException('Invalid credentials');

        const isMatching = await bcrypt.compare(password, user.password);
        if (!isMatching)
            throw new UnauthorizedException('Invalid credentials');

        return await this.generateTokens(user.id, user.email);
    }

    private async generateTokens(userId: number, email: string) {
        const payload = { id: userId, email };

        const accessToken = await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_SECRET,
            expiresIn: '15m',
        });

        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: '7d',
        });

        await this.saveRefreshToken(userId, refreshToken);

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
        };
    }

    private async saveRefreshToken(userId: number, refreshToken: string) {
        const hashed = await bcrypt.hash(refreshToken, 10);

        await this.redis.set(
            `refresh:${userId}`,
            hashed,
            'EX',
            7 * 24 * 60 * 60,
        );
    }

    async refresh(userId: number, refreshToken: string) {

        let payload;
        try {
            payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET,
            });
        } catch {
            throw new UnauthorizedException('Invalid refresh token');
        }

        const stored = await this.redis.get(`refresh:${userId}`);
        if (!stored)
            throw new UnauthorizedException('No refresh token');

        const isMatch = await bcrypt.compare(refreshToken, stored);
        if (!isMatch)
            throw new UnauthorizedException('Invalid refresh token');

        const user = await this.usersService.findOneById(userId);

        if (!user)
            throw new UnauthorizedException();

        await this.redis.del(`refresh:${userId}`);
        return this.generateTokens(user.id, user.email);
    }

    async logout(refreshToken: string) {

        let payload;
        try {
            payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET,
            });
        } catch {
            throw new UnauthorizedException('Invalid refresh token');
        }

        await this.redis.del(`refresh:${payload.id}`);
        return { message: 'Logged out' };
    }

    async getUser(token: string) {
        try {
            const {id} = this.jwtService.verify(token);
            return await this.usersService.findOneById(id);
        } catch (e) {
            throw new UnauthorizedException('Invalid token');
        }
    }
}
