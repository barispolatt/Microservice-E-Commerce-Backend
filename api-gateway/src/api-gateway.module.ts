import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AUTH_SERVICE, USERS_SERVICE, PRODUCTS_SERVICE, ORDERS_SERVICE, CART_SERVICE } from '@ecommerce/common';
import { AuthController } from './controllers/auth.controller';
import { UsersController } from './controllers/users.controller';

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
            // We will add PRODUCTS, ORDERS, and CART services here in the future
        ]),
    ],
    controllers: [AuthController, UsersController],
    providers: [],
})
export class ApiGatewayModule {}