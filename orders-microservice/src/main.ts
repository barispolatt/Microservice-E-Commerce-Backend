import { NestFactory } from '@nestjs/core';
import { OrdersModule } from './orders.module';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(OrdersModule);
    const configService = app.get(ConfigService);

    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.TCP,
        options: {
            host: '0.0.0.0',
            port: configService.get<number>('ORDERS_SERVICE_PORT'),
        },
    });

    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    await app.startAllMicroservices();
    console.log('Orders microservice is running');
}
bootstrap();