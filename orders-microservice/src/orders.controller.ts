import { Controller, ParseIntPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller()
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    @MessagePattern({ cmd: 'create_order' })
    create(@Payload() createOrderDto: CreateOrderDto) {
        return this.ordersService.create(createOrderDto);
    }

    @MessagePattern({ cmd: 'get_order_by_id' })
    findOne(@Payload('id', ParseIntPipe) id: number) {
        return this.ordersService.findOne(id);
    }

    @MessagePattern({ cmd: 'update_order_status' })
    updateStatus(
        @Payload('id', ParseIntPipe) id: number,
        @Payload('data') updateOrderDto: UpdateOrderDto,
    ) {
        return this.ordersService.updateStatus(id, updateOrderDto);
    }
}