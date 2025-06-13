import { NestFactory } from '@nestjs/core';
import { StockModule } from './stock.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
    const app = await NestFactory.create(StockModule);
    const configService = app.get(ConfigService);

    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.KAFKA,
        options: {
            client: {
                brokers: [configService.get<string>('KAFKA_BROKER')],
            },
            consumer: {
                groupId: 'stock-consumer-group',
            },
        },
    });

    await app.startAllMicroservices();
    console.log('Stock microservice is running and listening for Kafka events');
}
bootstrap();