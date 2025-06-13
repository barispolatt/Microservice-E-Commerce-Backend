import { NestFactory } from '@nestjs/core';
import { UsersModule } from './users.module';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(UsersModule);
    const configService = app.get(ConfigService);

    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.TCP,
        options: {
            host: '0.0.0.0', // Listen on all interfaces within the Docker network
            port: configService.get<number>('USERS_SERVICE_PORT'),
        },
    });

    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    await app.startAllMicroservices();
    console.log('Users microservice is running');
}
bootstrap();