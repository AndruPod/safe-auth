import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class SignUpDto {
    @IsEmail()
    email: string;

    @MinLength(8)
    password: string;

    @MinLength(8)
    confirmedPassword: string;
}
