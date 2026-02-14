import Redis from 'ioredis';
import { Provider } from '@nestjs/common';

export const RedisProvider: Provider = {
    provide: 'REDIS',
    useFactory: () => {
        const client = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: Number(process.env.REDIS_PORT) || 6379,
        });

        client.on('error', (err) => {
            console.error('[Redis] Error', err);
        });

        return client;
    },
};
