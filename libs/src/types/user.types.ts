export enum UserRole {
    GUEST = 'GUEST',
    SELLER = 'SELLER',
    USER = 'USER',
    ADMIN = 'ADMIN',
    SUPER_ADMIN = 'SUPER_ADMIN',
}

export interface JwtPayload {
    sub: number;
    email: string;
    role: UserRole;
}

export interface UserRecord {
    id: number;
    name: string;
    email: string;
    password: string;
    is_active: boolean;
    role: UserRole;
    birthdate: Date;
    created_at: Date;
    updated_at: Date;
}