import {
    Controller,
    Post,
    Body,
    Inject,
    UseGuards,
    Get,
    Delete,
    BadRequestException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AddToCartDto, CART_SERVICE, PRODUCTS_SERVICE, JwtPayload } from '@ecommerce/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { firstValueFrom } from 'rxjs';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
    // FIX: Injected both cart and products clients.
    constructor(
        @Inject(CART_SERVICE) private readonly cartClient: ClientProxy,
        @Inject(PRODUCTS_SERVICE) private readonly productsClient: ClientProxy,
    ) {}

    @Post('add')
    // FIX: The entire function is updated to be secure.
    async addToCart(@Body() addToCartDto: AddToCartDto, @CurrentUser() user: JwtPayload) {
        // Step 1: Verify the product exists and get its real price and name.
        const product = await firstValueFrom(
            this.productsClient.send({ cmd: 'get_product_by_id' }, { id: addToCartDto.productId })
        );

        if (!product) {
            throw new BadRequestException(`Product with ID #${addToCartDto.productId} not found.`);
        }

        if (product.stock < addToCartDto.quantity) {
            throw new BadRequestException(`Insufficient stock for product #${product.name}.`);
        }

        // Step 2: Create a secure payload for the cart service.
        const payload = {
            userId: user.sub,
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: addToCartDto.quantity,
        };

        // Step 3: Send the secure payload to the cart service.
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