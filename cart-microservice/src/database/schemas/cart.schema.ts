import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CartDocument = Cart & Document;

@Schema({ _id: false })
class CartItem {
    @Prop({ required: true })
    productId: number;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    quantity: number;

    @Prop({ required: true })
    price: number;
}

const CartItemSchema = SchemaFactory.createForClass(CartItem);

@Schema({ timestamps: true, versionKey: false })
export class Cart {
    @Prop({ required: true, unique: true, index: true })
    userId: number;

    @Prop({ type: [CartItemSchema], default: [] })
    items: CartItem[];
}

export const CartSchema = SchemaFactory.createForClass(Cart);

CartSchema.virtual('totalPrice').get(function (this: CartDocument) {
    return this.items.reduce((total, item) => total + item.quantity * item.price, 0);
});

CartSchema.virtual('totalItems').get(function (this: CartDocument) {
    return this.items.reduce((total, item) => total + item.quantity, 0);
});

CartSchema.set('toJSON', { virtuals: true });
CartSchema.set('toObject', { virtuals: true });