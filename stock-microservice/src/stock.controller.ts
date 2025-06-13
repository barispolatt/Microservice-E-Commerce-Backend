import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { StockService } from './stock.service';
import { OrderCreatedEvent, TOPIC_ORDER_CREATED } from '@ecommerce/common';

@Controller()
export class StockController {
    constructor(private readonly stockService: StockService) {}

    @EventPattern(TOPIC_ORDER_CREATED)
    handleOrderCreated(@Payload() orderCreatedEvent: OrderCreatedEvent) {
        this.stockService.handleOrderCreated(orderCreatedEvent);
    }
}