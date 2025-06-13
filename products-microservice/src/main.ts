import { NestFactory } from '@nestjs/core';
import { ProductsModule } from './products.module';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(ProductsModule);
    const configService = app.get(ConfigService);

    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.TCP,
        options: {
            host: '0.0.0.0',
            port: configService.get<number>('PRODUCTS_SERVICE_PORT'),
        },
    });

    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    await app.startAllMicroservices();
    console.log('Products microservice is running');
}
bootstrap();