import { Controller, Post, Body, Get, Delete, Inject, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CART_SERVICE, JwtPayload } from '@ecommerce/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AddToCartDto } from 'apps/cart-microservice/src/dto/add-to-cart.dto';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
    constructor(@Inject(CART_SERVICE) private readonly cartClient: ClientProxy) {}

    @Post('add')
    addToCart(@Body() addToCartDto: AddToCartDto, @CurrentUser() user: JwtPayload) {
        const payload = { ...addToCartDto, userId: user.sub };
        return this.cartClient.send({ cmd: 'add_to_cart' }, payload);
    }

    @Get()
    getCart(@CurrentUser() user: JwtPayload) {
        return this.cartClient.send({ cmd: 'get_cart' }, { userId: user.sub });
    }

    @Delete()
    clearCart(@CurrentUser() user: JwtPayload) {
        return this.cartClient.send({ cmd: 'clear_cart' }, { userId: user.sub });
    }
}