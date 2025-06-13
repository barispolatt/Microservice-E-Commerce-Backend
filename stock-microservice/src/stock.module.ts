import { Module } from '@nestjs/common';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PRODUCTS_SERVICE } from '@ecommerce/common';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: './.env' }),
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
        ]),
    ],
    controllers: [StockController],
    providers: [StockService],
})
export class StockModule {}