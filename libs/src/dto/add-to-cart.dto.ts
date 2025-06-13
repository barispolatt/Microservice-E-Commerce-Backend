import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class AddToCartDto {
    @IsNumber()
    @IsNotEmpty()
    productId!: number;

    @IsNumber()
    @Min(1)
    @IsNotEmpty()
    quantity!: number;
}