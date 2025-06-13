import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Product } from './product.entity';

@Entity('product_images')
export class Image extends BaseEntity {
    @Column({ type: 'varchar', length: 255 })
    url: string;

    @ManyToOne(() => Product, (product) => product.images, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'product_id' })
    product: Product;
}