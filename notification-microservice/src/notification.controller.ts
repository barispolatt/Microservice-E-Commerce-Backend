import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { OrderCreatedEvent, TOPIC_ORDER_CREATED } from '@ecommerce/common';
import { NotificationService } from './notification.service';

@Controller()
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    @EventPattern(TOPIC_ORDER_CREATED)
    handleOrderCreated(@Payload() orderCreatedEvent: OrderCreatedEvent) {
        this.notificationService.handleOrderCreated(orderCreatedEvent);
    }
}