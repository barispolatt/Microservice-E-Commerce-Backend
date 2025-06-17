import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { OrderCreatedEvent, PRODUCTS_SERVICE } from '@ecommerce/common';

@Injectable()
export class StockService implements OnModuleInit {
    constructor(
        @Inject(PRODUCTS_SERVICE) private readonly productsClient: ClientProxy,
    ) {}

    async onModuleInit() {
        await this.productsClient.connect();
    }

    handleOrderCreated(orderCreatedEvent: OrderCreatedEvent) {
        console.log('Stock Service: Received OrderCreatedEvent', orderCreatedEvent);
        for (const item of orderCreatedEvent.items) {
            this.productsClient.send(
                { cmd: 'update_product_stock' },
                { id: item.productId, quantity: item.quantity },
            ).subscribe();
        }
    }
}