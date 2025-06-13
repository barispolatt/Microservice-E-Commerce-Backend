import { Injectable } from '@nestjs/common';
import { OrderCreatedEvent } from '@ecommerce/common';

@Injectable()
export class ShippingService {
    handleOrderCreated(orderCreatedEvent: OrderCreatedEvent) {
        // In a real application, this would integrate with a shipping
        // provider's API (e.g., FedEx, UPS) to create a shipment.
        console.log(
            `[Shipping Service]: Creating shipping label for order #${orderCreatedEvent.orderId}. Total Price: ${orderCreatedEvent.totalPrice}`,
        );
    }
}