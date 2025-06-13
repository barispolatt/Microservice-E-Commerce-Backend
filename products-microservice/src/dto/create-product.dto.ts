import { IsString, IsNumber, IsInt, IsPositive, IsArray, IsOptional, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

class ProductImageDto {
    @IsString()
    url: string;

    @IsInt()
    @Min(0)
    index: number;
}

export class CreateProductDto {
    @IsString()
    name: string;

    @IsString()
    description: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    price: number;

    @IsInt()
    @Min(0)
    stock: number;

    @IsInt()
    @IsPositive()
    sellerId: number;

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => ProductImageDto)
    images?: ProductImageDto[];
}