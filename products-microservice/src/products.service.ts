import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Product } from './database/entities/product.entity';
import { ProductImage } from './database/entities/product-image.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginatedResult, PaginationOptions } from '@ecommerce/common';
import { RedisService } from './redis/redis.service';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        @InjectRepository(ProductImage)
        private readonly productImageRepository: Repository<ProductImage>,
        private readonly redisService: RedisService,
    ) {}

    async create(createProductDto: CreateProductDto): Promise<Product> {
        const { images, ...productData } = createProductDto;
        const product = this.productRepository.create(productData);
        const savedProduct = await this.productRepository.save(product);

        if (images && images.length > 0) {
            const imageEntities = images.map((img) =>
                this.productImageRepository.create({ ...img, product: savedProduct }),
            );
            await this.productImageRepository.save(imageEntities);
            savedProduct.images = imageEntities;
        }
        await this.redisService.delWithPrefix('products:'); // Invalidate lists
        return savedProduct;
    }

    async findAll(options: PaginationOptions): Promise<PaginatedResult<Product>> {
        const { page = 1, limit = 10, sort = 'id', order = 'ASC' } = options;
        const cacheKey = `products:all:page=${page}&limit=${limit}&sort=${sort}&order=${order}`;
        const cachedData = await this.redisService.get(cacheKey);

        if (cachedData) {
            return JSON.parse(cachedData);
        }

        const [data, total] = await this.productRepository.findAndCount({
            relations: ['images'],
            order: { [sort]: order.toUpperCase() as 'ASC' | 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });

        const result = { data, total, page, limit };
        await this.redisService.set(cacheKey, JSON.stringify(result), 3600); // Cache for 1 hour

        return result;
    }

    async findOne(id: number): Promise<Product> {
        const cacheKey = `products:${id}`;
        const cachedData = await this.redisService.get(cacheKey);

        if (cachedData) {
            return JSON.parse(cachedData);
        }

        const product = await this.productRepository.findOne({
            where: { id },
            relations: ['images'],
        });

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        await this.redisService.set(cacheKey, JSON.stringify(product), 3600);
        return product;
    }

    async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
        const product = await this.findOne(id); // Use findOne to ensure it exists
        Object.assign(product, updateProductDto);
        const updatedProduct = await this.productRepository.save(product);

        // Invalidate caches
        await this.redisService.del(`products:${id}`);
        await this.redisService.delWithPrefix('products:all:');

        return updatedProduct;
    }

    async remove(id: number): Promise<{ message: string }> {
        const result = await this.productRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        // Invalidate caches
        await this.redisService.del(`products:${id}`);
        await this.redisService.delWithPrefix('products:all:');

        return { message: `Product with ID ${id} successfully deleted.` };
    }

    async search(query: string, options: PaginationOptions): Promise<PaginatedResult<Product>> {
        const { page = 1, limit = 10, sort = 'id', order = 'ASC' } = options;
        const [data, total] = await this.productRepository.findAndCount({
            where: [{ name: ILike(`%${query}%`) }, { description: ILike(`%${query}%`) }],
            relations: ['images'],
            order: { [sort]: order.toUpperCase() as 'ASC' | 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { data, total, page, limit };
    }

    async updateStock(id: number, quantityToDecrement: number): Promise<Product> {
        const product = await this.productRepository.findOneBy({ id });
        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        if (product.stock < quantityToDecrement) {
            throw new BadRequestException(`Insufficient stock for product #${id}`);
        }

        product.stock -= quantityToDecrement;

        // Invalidate caches since the data has changed
        await this.redisService.del(`products:${id}`);
        await this.redisService.delWithPrefix('products:all:');

        return this.productRepository.save(product);
    }
}