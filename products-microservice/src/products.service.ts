import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './database/entities/product.entity';
import { Image } from './database/entities/image.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { RedisService } from './redis/redis.service';
import { PaginationOptions, PaginatedResult } from '@ecommerce/common';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        @InjectRepository(Image)
        private readonly imageRepository: Repository<Image>,
        private readonly redisService: RedisService,
    ) {}

    async create(createProductDto: CreateProductDto): Promise<Product> {
        const { images: imageUrls, ...productData } = createProductDto;

        const product = this.productRepository.create(productData);

        if (imageUrls && imageUrls.length > 0) {
            product.images = imageUrls.map((url) =>
                this.imageRepository.create({ url }),
            );
        }

        await this.redisService.del('products_all'); // Yeni ürün eklendiği için cache'i temizle
        return this.productRepository.save(product);
    }

    async findAll(
        options: PaginationOptions,
    ): Promise<PaginatedResult<Product>> {
        const cacheKey = `products_all_page_${options.page}_limit_${options.limit}`;
        const cachedProducts = await this.redisService.get(cacheKey);

        if (cachedProducts) {
            return JSON.parse(cachedProducts);
        }

        const [data, total] = await this.productRepository.findAndCount({
            take: options.limit,
            skip: (options.page - 1) * options.limit,
        });

        const result: PaginatedResult<Product> = {
            data,
            total,
            page: options.page,
            limit: options.limit,
        };

        await this.redisService.set(cacheKey, JSON.stringify(result), 3600); // 1 saat cache
        return result;
    }

    async findOne(id: number): Promise<Product> {
        const cacheKey = `product_${id}`;
        const cachedProduct = await this.redisService.get(cacheKey);

        if (cachedProduct) {
            return JSON.parse(cachedProduct);
        }

        const product = await this.productRepository.findOneBy({ id });

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        await this.redisService.set(cacheKey, JSON.stringify(product), 3600);
        return product;
    }

    async update(
        id: number,
        updateProductDto: UpdateProductDto,
    ): Promise<Product> {
        const product = await this.productRepository.preload({
            id: id,
            ...updateProductDto,
        });

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        await this.redisService.del(`product_${id}`);
        await this.redisService.del('products_all');

        return this.productRepository.save(product);
    }

    async remove(id: number): Promise<{ message: string }> {
        const result = await this.productRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        await this.redisService.del(`product_${id}`);
        await this.redisService.del('products_all');

        return { message: `Product with ID ${id} successfully deleted` };
    }

    async updateStock(productId: number, quantity: number): Promise<Product> {
        const product = await this.findOne(productId);
        product.stock -= quantity;

        await this.redisService.del(`product_${productId}`);
        await this.redisService.del('products_all');

        return this.productRepository.save(product);
    }
}