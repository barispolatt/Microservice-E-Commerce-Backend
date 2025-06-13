import { NestFactory } from '@nestjs/core';
import { NotificationModule } from './notification.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
    const app = await NestFactory.create(NotificationModule);
    const configService = app.get(ConfigService);

    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.KAFKA,
        options: {
            client: { brokers: [configService.get<string>('KAFKA_BROKER')] },
            consumer: { groupId: 'notification-consumer-group' }, // Different group ID
        },
    });

    await app.startAllMicroservices();
    console.log('Notification microservice is running');
}
bootstrap();