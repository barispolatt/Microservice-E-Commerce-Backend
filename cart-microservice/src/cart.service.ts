import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartDocument } from './database/schemas/cart.schema';


interface AddToCartInternalDto {
    userId: number;
    productId: number;
    name: string;
    price: number;
    quantity: number;
}

@Injectable()
export class CartService {
    constructor(@InjectModel(Cart.name) private cartModel: Model<CartDocument>) {}

    async addToCart(dto: AddToCartInternalDto) {
        const cart = await this.cartModel.findOne({ userId: dto.userId });

        if (!cart) {
            // If no cart exists for the user, create a new one.
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

        const itemIndex = cart.items.findIndex(
            (item) => item.productId === dto.productId,
        );

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += dto.quantity;
        } else {
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