import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrderStatus } from '@ecommerce/common';

export class UpdateOrderDto {
    @IsEnum(OrderStatus)
    @IsNotEmpty()
    status: OrderStatus;
}