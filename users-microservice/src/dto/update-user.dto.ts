import {
    IsBoolean,
    IsEmail,
    IsEnum,
    IsOptional,
    IsString,
    IsStrongPassword,
} from 'class-validator';
import { UserRole } from '@ecommerce/common';

export class UpdateUserDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsStrongPassword()
    @IsOptional()
    password?: string;

    @IsOptional()
    birthdate?: Date;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole;
}