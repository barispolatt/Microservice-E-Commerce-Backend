export enum OrderStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    SHIPPED = 'shipped',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled',
}

export type OrderItemData = {
    productId: number;
    quantity: number;
    unitPrice: number;
};