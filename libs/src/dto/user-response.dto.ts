import { UserRole } from "../types/user.types";

export class UserResponseDto {
    id!: number;
    name!: string;
    email!: string;
    birthdate!: Date;
    role!: UserRole;
}