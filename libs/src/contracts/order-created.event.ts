import { OrderItemData } from '../types/order.types';

export class OrderCreatedEvent {
    constructor(
        public readonly orderId: number,
        public readonly userId: number,
        public readonly totalPrice: number,
        public readonly items: OrderItemData[],
    ) {}

    toString() {
        return JSON.stringify(this);
    }
}