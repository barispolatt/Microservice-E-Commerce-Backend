import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './auth/common/filters/http-exception.filter';
import { TransformResponseInterceptor } from './auth/interceptors/transform-response.interceptor';

async function bootstrap() {
    const app = await NestFactory.create(ApiGatewayModule);
    const configService = app.get(ConfigService);
    const port = configService.get('API_GATEWAY_PORT');

    app.setGlobalPrefix('api/v1');
    app.enableCors();

    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new TransformResponseInterceptor());


    await app.listen(port);
    console.log(`API Gateway is running on: http://localhost:${port}`);
}
bootstrap();