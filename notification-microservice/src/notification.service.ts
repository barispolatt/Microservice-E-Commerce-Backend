import { Injectable } from '@nestjs/common';
import { OrderCreatedEvent } from '@ecommerce/common';

@Injectable()
export class NotificationService {
    handleOrderCreated(orderCreatedEvent: OrderCreatedEvent) {
        // In a real application, this would integrate with an email service
        // like SendGrid or AWS SES. For now, we log to the console.
        console.log(
            `[Notification Service]: Sending confirmation email for order #${orderCreatedEvent.orderId} to user #${orderCreatedEvent.userId}.`,
        );
    }
}