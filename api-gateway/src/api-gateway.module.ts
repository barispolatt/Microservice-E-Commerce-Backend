import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import {
    AUTH_SERVICE,
    USERS_SERVICE,
    PRODUCTS_SERVICE,
    ORDERS_SERVICE,
    CART_SERVICE,
} from '@ecommerce/common';

import { AuthController } from './auth/controllers/auth.controller';
import { UsersController } from './auth/controllers/users.controller';
import { CartController } from './controllers/cart.controller';
import { OrdersController } from './controllers/orders.controller';
import { ProductsController } from './controllers/products.controller';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: join(process.cwd(), '.env'),
        }),
        ClientsModule.registerAsync([
            {
                name: AUTH_SERVICE,
                imports: [ConfigModule],
                inject: [ConfigService],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.TCP,
                    options: {
                        host: 'auth-microservice',
                        port: configService.get<number>('AUTH_SERVICE_PORT'),
                    },
                }),
            },
            {
                name: USERS_SERVICE,
                imports: [ConfigModule],
                inject: [ConfigService],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.TCP,
                    options: {
                        host: 'users-microservice',
                        port: configService.get<number>('USERS_SERVICE_PORT'),
                    },
                }),
            },
            {
                name: PRODUCTS_SERVICE,
                imports: [ConfigModule],
                inject: [ConfigService],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.TCP,
                    options: {
                        host: 'products-microservice',
                        port: configService.get<number>('PRODUCTS_SERVICE_PORT'),
                    },
                }),
            },
            {
                name: ORDERS_SERVICE,
                imports: [ConfigModule],
                inject: [ConfigService],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.TCP,
                    options: {
                        host: 'orders-microservice',
                        port: configService.get<number>('ORDERS_SERVICE_PORT'),
                    },
                }),
            },
            {
                name: CART_SERVICE,
                imports: [ConfigModule],
                inject: [ConfigService],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.TCP,
                    options: {
                        host: 'cart-microservice',
                        port: configService.get<number>('CART_SERVICE_PORT'),
                    },
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
    providers: [JwtAuthGuard, RolesGuard],
})
export class ApiGatewayModule {}