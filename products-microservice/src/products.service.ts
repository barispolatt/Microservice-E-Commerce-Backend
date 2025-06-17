import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
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

        await this.redisService.delWithPrefix('products_all_page_');
        return this.productRepository.save(product);
    }

    async findAll(
        options: PaginationOptions,
    ): Promise<PaginatedResult<Product>> {
        const page = options.page || 1;
        const limit = options.limit || 10;
        const cacheKey = `products_all_page_${page}_limit_${limit}`;
        const cachedProducts = await this.redisService.get(cacheKey);

        if (cachedProducts) {
            return JSON.parse(cachedProducts);
        }

        const [data, total] = await this.productRepository.findAndCount({
            take: limit,
            skip: (page - 1) * limit,
        });

        const paginatedResult = { data, total, page, limit };

        await this.redisService.set(cacheKey, JSON.stringify(paginatedResult), 3600);
        return paginatedResult;
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
        const { images: imageUrls, ...otherUpdateData } = updateProductDto;

        const product = await this.productRepository.findOne({
            where: { id },
            relations: ['images'],
        });

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        Object.assign(product, otherUpdateData);

        if (imageUrls) {
            await this.imageRepository.remove(product.images);
            product.images = imageUrls.map(url => this.imageRepository.create({ url }));
        }

        await this.redisService.del(`product_${id}`);
        await this.redisService.delWithPrefix('products_all_page_');

        return this.productRepository.save(product);
    }

    async remove(id: number): Promise<{ message: string }> {
        const result = await this.productRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        await this.redisService.del(`product_${id}`);
        await this.redisService.delWithPrefix('products_all_page_');

        return { message: `Product with ID ${id} successfully deleted` };
    }

    async updateStock(productId: number, quantity: number): Promise<Product> {
        const product = await this.findOne(productId);
        product.stock -= quantity;

        await this.redisService.del(`product_${productId}`);
        await this.redisService.delWithPrefix('products_all_page_');

        return this.productRepository.save(product);
    }

    async search(query: string, options: PaginationOptions): Promise<PaginatedResult<Product>> {
        const page = options.page || 1;
        const limit = options.limit || 10;

        const [data, total] = await this.productRepository.findAndCount({
            where: [
                { name: ILike(`%${query}%`) },
                { description: ILike(`%${query}%`) }
            ],
            take: limit,
            skip: (page - 1) * limit,
        });

        return { data, total, page, limit };
    }
}