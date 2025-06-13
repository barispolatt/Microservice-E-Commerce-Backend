import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsPositive, ValidateNested } from 'class-validator';

class OrderProductDto {
    @IsInt()
    @IsNotEmpty()
    productId: number;

    @IsInt()
    @IsPositive()
    quantity: number;
}

export class CreateOrderDto {
    @IsInt()
    @IsNotEmpty()
    userId: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderProductDto)
    products: OrderProductDto[];
}