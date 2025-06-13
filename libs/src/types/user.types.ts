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