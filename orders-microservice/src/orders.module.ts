import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './database/entities/order.entity';
import { OrderItem } from './database/entities/order-item.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KAFKA_SERVICE, PRODUCTS_SERVICE } from '@ecommerce/common';

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
                host: configService.get<string>('ORDERS_DB_HOST'),
                port: configService.get<number>('ORDERS_DB_PORT'),
                username: configService.get<string>('ORDERS_DB_USER'),
                password: configService.get<string>('ORDERS_DB_PASSWORD'),
                database: configService.get<string>('ORDERS_DB_NAME'),
                entities: [Order, OrderItem],
                synchronize: true,
            }),
        }),
        TypeOrmModule.forFeature([Order, OrderItem]),
        ClientsModule.registerAsync([
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
                name: KAFKA_SERVICE,
                imports: [ConfigModule],
                inject: [ConfigService],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.KAFKA,
                    options: {
                        client: {
                            clientId: 'orders',
                            brokers: [configService.get<string>('KAFKA_BROKER')],
                        },
                        producer: {
                            allowAutoTopicCreation: true,
                        },
                    },
                }),
            },
        ]),
    ],
    controllers: [OrdersController],
    providers: [OrdersService],
})
export class OrdersModule {}