import {
    IsBoolean,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsStrongPassword,
} from 'class-validator';
import { UserRole } from '@ecommerce/common';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty({ message: 'Name is required' })
    name: string;

    @IsEmail({}, { message: 'A valid email is required' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @IsNotEmpty({ message: 'Password is required' })
    @IsStrongPassword({}, { message: 'Password is too weak' })
    password: string;

    @IsOptional()
    birthdate?: Date;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean = true;

    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole = UserRole.USER;
}