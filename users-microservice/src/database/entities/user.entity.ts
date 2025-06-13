import { UserRole } from '@ecommerce/common';
import { Column, Entity } from 'typeorm';
import { BaseEntityWithName } from './base-with-name.entity';

@Entity('users')
export class User extends BaseEntityWithName {
    @Column({ type: 'varchar', length: 200, unique: true })
    email: string;

    @Column({ type: 'varchar', length: 100, unique: false, select: false }) // Hide password by default
    password: string;

    @Column({ type: 'boolean', default: true })
    is_active: boolean;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
    role: UserRole;

    @Column({ type: 'timestamp', nullable: true })
    birthdate: Date;

    constructor(base?: Partial<User>) {
        super();
        if(base) {
            Object.assign(this, base);
        }
    }
}