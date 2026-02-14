import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as bcrypt from 'bcrypt';
import * as schema from '../db/schema';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class UsersService {

    constructor(
        @Inject('DRIZZLE')
        private db: NodePgDatabase<typeof schema>
    ) {}

    async create(createUserDto: CreateUserDto) {

        const {email, password} = createUserDto;
        const hashedPassword = await bcrypt.hash(password, 12);

        try {
            const [user] = await this.db
                .insert(users)
                .values({ email, password: hashedPassword })
                .returning();

            return user;
        } catch (e) {
            throw new BadRequestException('User already exists');
        }
    }

    async findOneById(id: number) {

        const [user] = await this.db
            .select()
            .from(users)
            .where(eq(users.id, id));

        return user;
    }

    async findOneByEmail(email: string) {

        const [user] = await this.db
            .select()
            .from(users)
            .where(eq(users.email, email));

        return user;
    }
}
