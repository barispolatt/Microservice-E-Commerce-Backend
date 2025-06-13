import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
    AUTH_SERVICE,
    USERS_SERVICE,
    PRODUCTS_SERVICE,
    ORDERS_SERVICE,
    CART_SERVICE,
} from '@ecommerce/common';
import { AuthController } from './controllers/auth.controller';
import { UsersController } from './controllers/users.controller';
import { ProductsController } from './controllers/products.controller';
import { OrdersController } from './controllers/orders.controller';
import { CartController } from './controllers/cart.controller';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: './.env',
        }),
        ClientsModule.registerAsync([
            {
                name: AUTH_SERVICE,
                imports: [ConfigModule],
                inject: [ConfigService],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.TCP,
                    options: { host: 'auth-microservice', port: configService.get<number>('AUTH_SERVICE_PORT') },
                }),
            },
            {
                name: USERS_SERVICE,
                imports: [ConfigModule],
                inject: [ConfigService],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.TCP,
                    options: { host: 'users-microservice', port: configService.get<number>('USERS_SERVICE_PORT') },
                }),
            },
            {
                name: PRODUCTS_SERVICE,
                imports: [ConfigModule],
                inject: [ConfigService],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.TCP,
                    options: { host: 'products-microservice', port: configService.get<number>('PRODUCTS_SERVICE_PORT') },
                }),
            },
            {
                name: ORDERS_SERVICE,
                imports: [ConfigModule],
                inject: [ConfigService],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.TCP,
                    options: { host: 'orders-microservice', port: configService.get<number>('ORDERS_SERVICE_PORT') },
                }),
            },
            {
                name: CART_SERVICE,
                imports: [ConfigModule],
                inject: [ConfigService],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.TCP,
                    options: { host: 'cart-microservice', port: configService.get<number>('CART_SERVICE_PORT') },
                }),
            },
        ]),
    ],
    controllers: [
        AuthController,
        UsersController,
        ProductsController,
        OrdersController,
        CartController,
    ],
    providers: [],
})
export class ApiGatewayModule {}