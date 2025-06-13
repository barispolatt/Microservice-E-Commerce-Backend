import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatus } from '@ecommerce/common';

@Entity('orders')
export class Order extends BaseEntity {
    @Column()
    userId: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    totalPrice: number;

    @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
    status: OrderStatus;

    @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
    items: OrderItem[];
}