import { PartialType } from '@nestjs/mapped-types';
import { SignUpDto } from './sign-up.dto';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto extends PartialType(SignUpDto) {
    @IsEmail()
    email: string;

    @IsNotEmpty()
    password: string;
}
