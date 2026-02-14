import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post('create')
    create(createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Get('get-by-id/:id')
    findOne(@Param('id') id: string) {
        return this.usersService.findOneById(+id);
    }

    @Get('get-by-email')
    findOneByEmail(@Query('email') email: string) {
        return this.usersService.findOneByEmail(email);
    }
}
