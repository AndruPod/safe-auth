import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersService } from '../users/users.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisModule } from '../redis/redis.module';

@Module({
    imports: [
        UsersModule,
        RedisModule,
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                // fail at startup instead of falling back to a known secret
                config.getOrThrow<string>('JWT_REFRESH_SECRET');
                return {
                    secret: config.getOrThrow<string>('JWT_SECRET'),
                    signOptions: { expiresIn: '15m' },
                };
            },
        })
    ],
    controllers: [AuthController],
    providers: [AuthService],
})
export class AuthModule {}
