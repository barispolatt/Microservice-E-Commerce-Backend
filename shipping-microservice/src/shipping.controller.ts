import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { OrderCreatedEvent, TOPIC_ORDER_CREATED } from '@ecommerce/common';
import { ShippingService } from './shipping.services';

@Controller()
export class ShippingController {
    constructor(private readonly shippingService: ShippingService) {}

    @EventPattern(TOPIC_ORDER_CREATED)
    handleOrderCreated(@Payload() orderCreatedEvent: OrderCreatedEvent) {
        this.shippingService.handleOrderCreated(orderCreatedEvent);
    }
}