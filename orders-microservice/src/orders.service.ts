import { Inject, Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Order } from './database/entities/order.entity';
import { OrderItem } from './database/entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { KAFKA_SERVICE, OrderCreatedEvent, PRODUCTS_SERVICE, OrderStatus, TOPIC_ORDER_CREATED } from '@ecommerce/common';

@Injectable()
export class OrdersService implements OnModuleInit {
    constructor(
        @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
        @Inject(PRODUCTS_SERVICE) private readonly productsClient: ClientProxy,
        @Inject(KAFKA_SERVICE) private readonly kafkaClient: ClientProxy,
        private readonly dataSource: DataSource,
    ) {}

    async onModuleInit() {
        await this.productsClient.connect();
        await this.kafkaClient.connect();
    }

    async create(createOrderDto: CreateOrderDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            let totalOrderPrice = 0;
            const orderItemsData = [];

            // 1. Validate products and calculate total price
            for (const item of createOrderDto.products) {
                const product = await firstValueFrom(
                    this.productsClient.send({ cmd: 'get_product_by_id' }, { id: item.productId }),
                );
                if (!product) {
                    throw new BadRequestException(`Product with ID #${item.productId} not found`);
                }
                if (product.stock < item.quantity) {
                    throw new BadRequestException(`Insufficient stock for product #${item.productId}`);
                }
                const itemPrice = product.price * item.quantity;
                totalOrderPrice += itemPrice;
                orderItemsData.push({ product, quantity: item.quantity, price: product.price });
            }

            // 2. Create and save the Order entity
            const order = queryRunner.manager.create(Order, {
                userId: createOrderDto.userId,
                totalPrice: totalOrderPrice,
                status: OrderStatus.PENDING,
            });
            const savedOrder = await queryRunner.manager.save(order);

            // 3. Create and save OrderItem entities
            const orderItems = orderItemsData.map(itemData =>
                queryRunner.manager.create(OrderItem, {
                    order: savedOrder,
                    productId: itemData.product.id,
                    quantity: itemData.quantity,
                    price: itemData.price,
                }),
            );
            await queryRunner.manager.save(orderItems);

            // 4. Commit the transaction
            await queryRunner.commitTransaction();

            // 5. Publish event to Kafka AFTER successful commit
            const event = new OrderCreatedEvent(
                savedOrder.id,
                savedOrder.userId,
                savedOrder.totalPrice,
                orderItems.map(oi => ({ productId: oi.productId, quantity: oi.quantity, unitPrice: oi.price, totalPrice: oi.price * oi.quantity }))
            );
            this.kafkaClient.emit(TOPIC_ORDER_CREATED, JSON.stringify(event));

            return savedOrder;
        } catch (error) {
            // 6. Rollback transaction on error
            await queryRunner.rollbackTransaction();
            throw error; // Re-throw the error to be handled by NestJS
        } finally {
            // 7. Release the query runner
            await queryRunner.release();
        }
    }

    async findOne(id: number): Promise<Order> {
        const order = await this.orderRepository.findOne({ where: { id }, relations: ['items'] });
        if (!order) {
            throw new NotFoundException(`Order with ID ${id} not found`);
        }
        return order;
    }

    async updateStatus(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
        const order = await this.findOne(id);
        order.status = updateOrderDto.status;
        return this.orderRepository.save(order);
    }
}