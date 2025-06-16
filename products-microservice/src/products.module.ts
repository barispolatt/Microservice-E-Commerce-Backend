import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from './redis/redis.module';
import { Product } from './database/entities/product.entity';
import { Image } from './database/entities/image.entity';

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
                entities: [Product, Image],
                synchronize: true, // Geliştirme ortamı için true
            }),
        }),
        TypeOrmModule.forFeature([Product, Image]), 
        RedisModule,
    ],
    controllers: [ProductsController],
    providers: [ProductsService],
})
export class ProductsModule {}