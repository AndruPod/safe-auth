import { Module } from '@nestjs/common';
import { DrizzleProvider } from './db.provider';

@Module({
    providers: [DrizzleProvider],
    exports: [DrizzleProvider],
})
export class DbModule {}
