import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartDocument } from './database/schemas/cart.schema';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Injectable()
export class CartService {
    constructor(@InjectModel(Cart.name) private cartModel: Model<CartDocument>) {}

    async addToCart(dto: AddToCartDto & { userId: number }) {
        const cart = await this.cartModel.findOne({ userId: dto.userId });

        if (!cart) {
            // If no cart exists for the user, create a new one
            const newCart = new this.cartModel({
                userId: dto.userId,
                items: [{
                    productId: dto.productId,
                    name: dto.name,
                    price: dto.price,
                    quantity: dto.quantity,
                }],
            });
            return newCart.save();
        }

        // If cart exists, check if the item is already in the cart
        const itemIndex = cart.items.findIndex(
            (item) => item.productId === dto.productId,
        );

        if (itemIndex > -1) {
            // If item exists, update the quantity
            cart.items[itemIndex].quantity += dto.quantity;
        } else {
            // If item does not exist, add it to the items array
            cart.items.push({
                productId: dto.productId,
                name: dto.name,
                price: dto.price,
                quantity: dto.quantity,
            });
        }

        return cart.save();
    }

    async getCart(userId: number) {
        return this.cartModel.findOne({ userId }).exec();
    }

    async clearCart(userId: number) {
        return this.cartModel.deleteOne({ userId }).exec();
    }
}