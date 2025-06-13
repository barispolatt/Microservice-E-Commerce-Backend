import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Controller()
export class CartController {
    constructor(private readonly cartService: CartService) {}

    @MessagePattern({ cmd: 'add_to_cart' })
    addToCart(@Payload() addToCartDto: AddToCartDto & { userId: number }) {
        return this.cartService.addToCart(addToCartDto);
    }

    @MessagePattern({ cmd: 'get_cart' })
    getCart(@Payload('userId') userId: number) {
        return this.cartService.getCart(userId);
    }

    @MessagePattern({ cmd: 'clear_cart' })
    clearCart(@Payload('userId') userId: number) {
        return this.cartService.clearCart(userId);
    }
}