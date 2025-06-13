import { NestFactory } from '@nestjs/core';
import { ShippingModule } from './shipping.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
    const app = await NestFactory.create(ShippingModule);
    const configService = app.get(ConfigService);

    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.KAFKA,
        options: {
            client: {
                brokers: [configService.get<string>('KAFKA_BROKER')],
            },
            consumer: {
                groupId: 'shipping-consumer-group', // Unique Group ID for this consumer
            },
        },
    });

    await app.startAllMicroservices();
    console.log('Shipping microservice is running and listening for Kafka events');
}
bootstrap();