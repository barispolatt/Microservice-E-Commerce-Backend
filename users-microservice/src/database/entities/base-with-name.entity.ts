import { BaseEntity } from './base.entity';
import { Column } from 'typeorm';

export abstract class BaseEntityWithName extends BaseEntity {
    @Column({ type: 'varchar', length: 150, unique: false })
    name: string;
}