import { Module } from '@nestjs/common';
import { ShippingController } from './shipping.controller';
import { ShippingService } from './shipping.service';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true, envFilePath: './.env' })],
    controllers: [ShippingController],
    providers: [ShippingService],
})
export class ShippingModule {}