import { Controller, Post, Body, Get, Param, ParseIntPipe, Inject, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ORDERS_SERVICE, JwtPayload } from '@ecommerce/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateOrderDto } from 'apps/orders-microservice/src/dto/create-order.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
    constructor(@Inject(ORDERS_SERVICE) private readonly ordersClient: ClientProxy) {}

    @Post()
    createOrder(@Body() createOrderDto: Omit<CreateOrderDto, 'userId'>, @CurrentUser() user: JwtPayload) {
        // Add the userId from the token to the DTO before sending
        const orderData = { ...createOrderDto, userId: user.sub };
        return this.ordersClient.send({ cmd: 'create_order' }, orderData);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        // In a real app, you'd add logic to ensure a user can only see their own orders
        return this.ordersClient.send({ cmd: 'get_order_by_id' }, { id });
    }
}