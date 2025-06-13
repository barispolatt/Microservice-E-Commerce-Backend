import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './database/entities/product.entity';
import { ProductImage } from './database/entities/product-image.entity';
import { RedisModule } from './redis/redis.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: './.env',
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get<string>('PRODUCTS_DB_HOST'),
                port: configService.get<number>('PRODUCTS_DB_PORT'),
                username: configService.get<string>('PRODUCTS_DB_USER'),
                password: configService.get<string>('PRODUCTS_DB_PASSWORD'),
                database: configService.get<string>('PRODUCTS_DB_NAME'),
                entities: [Product, ProductImage],
                synchronize: true, // Should be false in production
            }),
        }),
        TypeOrmModule.forFeature([Product, ProductImage]),
        RedisModule,
    ],
    controllers: [ProductsController],
    providers: [ProductsService],
})
export class ProductsModule {}