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
import { createHash, randomUUID, timingSafeEqual } from 'crypto';

// Deletes the key only if it still holds the expected value (one atomic step),
// so a refresh token can be used at most once, even by concurrent requests.
const CONSUME_SCRIPT = `
if redis.call('get', KEYS[1]) == ARGV[1] then
    return redis.call('del', KEYS[1])
end
return 0
`;

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

        // jti makes every refresh token unique, even within the same second
        const refreshToken = await this.jwtService.signAsync(
            { ...payload, jti: randomUUID() },
            {
                secret: process.env.JWT_REFRESH_SECRET,
                expiresIn: '7d',
            },
        );

        await this.saveRefreshToken(userId, refreshToken);

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
        };
    }

    // bcrypt only reads the first 72 bytes, which are identical for one user's JWTs.
    // SHA-256 covers the whole token.
    private hashToken(token: string): string {
        return createHash('sha256').update(token).digest('hex');
    }

    private async saveRefreshToken(userId: number, refreshToken: string) {
        await this.redis.set(
            `refresh:${userId}`,
            this.hashToken(refreshToken),
            'EX',
            7 * 24 * 60 * 60,
        );
    }

    private async verifyRefreshToken(refreshToken: string): Promise<{ id: number }> {
        try {
            return await this.jwtService.verifyAsync(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET,
            });
        } catch {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    private async consumeRefreshToken(userId: number, refreshToken: string) {
        const key = `refresh:${userId}`;
        const stored = await this.redis.get(key);
        if (!stored)
            throw new UnauthorizedException('No refresh token');

        const actual = Buffer.from(this.hashToken(refreshToken));
        const expected = Buffer.from(stored);
        if (actual.length !== expected.length || !timingSafeEqual(actual, expected))
            throw new UnauthorizedException('Invalid refresh token');

        const consumed = await this.redis.eval(CONSUME_SCRIPT, 1, key, stored);
        if (consumed !== 1)
            throw new UnauthorizedException('Invalid refresh token');
    }

    async refresh(refreshToken: string) {
        const { id } = await this.verifyRefreshToken(refreshToken);
        await this.consumeRefreshToken(id, refreshToken);

        const user = await this.usersService.findOneById(id);
        if (!user)
            throw new UnauthorizedException();

        return this.generateTokens(user.id, user.email);
    }

    async logout(refreshToken: string) {
        const { id } = await this.verifyRefreshToken(refreshToken);
        await this.consumeRefreshToken(id, refreshToken);
        return { message: 'Logged out' };
    }

    async getUser(token: string) {
        let id: number;
        try {
            ({ id } = this.jwtService.verify(token));
        } catch {
            throw new UnauthorizedException('Invalid token');
        }

        const user = await this.usersService.findOneById(id);
        if (!user)
            throw new UnauthorizedException('Invalid token');
        return user;
    }
}
