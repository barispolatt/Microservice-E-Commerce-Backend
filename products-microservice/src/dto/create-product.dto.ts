import {
    IsString,
    IsNumber,
    IsNotEmpty,
    IsOptional,
    IsArray,
    Min,
} from 'class-validator';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @Min(0)
    price: number;

    @IsNumber()
    @Min(0)
    stock: number;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    images?: string[];
}