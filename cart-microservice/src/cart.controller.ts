import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CartService } from './cart.service';

// FIX: Define the expected payload shape for clarity.
interface AddToCartPayload {
    userId: number;
    productId: number;
    name: string;
    price: number;
    quantity: number;
}

@Controller()
export class CartController {
    constructor(private readonly cartService: CartService) {}

    @MessagePattern({ cmd: 'add_to_cart' })
    addToCart(@Payload() payload: AddToCartPayload) {
        return this.cartService.addToCart(payload);
    }

    @MessagePattern({ cmd: 'get_cart' })
    getCart(@Payload() data: { userId: number }) {
        return this.cartService.getCart(data.userId);
    }

    @MessagePattern({ cmd: 'clear_cart' })
    clearCart(@Payload() data: { userId: number }) {
        return this.cartService.clearCart(data.userId);
    }
}