import { Controller, ParseIntPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductsService } from './products.service';
import { PaginationOptions } from '@ecommerce/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller()
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @MessagePattern({ cmd: 'create_product' })
    create(@Payload() createProductDto: CreateProductDto) {
        return this.productsService.create(createProductDto);
    }

    @MessagePattern({ cmd: 'get_all_products' })
    findAll(@Payload() paginationOptions: PaginationOptions) {
        return this.productsService.findAll(paginationOptions);
    }

    @MessagePattern({ cmd: 'get_product_by_id' })
    findOne(@Payload('id', ParseIntPipe) id: number) {
        return this.productsService.findOne(id);
    }

    @MessagePattern({ cmd: 'update_product' })
    update(
        @Payload('id', ParseIntPipe) id: number,
        @Payload('data') updateProductDto: UpdateProductDto,
    ) {
        return this.productsService.update(id, updateProductDto);
    }

    @MessagePattern({ cmd: 'delete_product' })
    remove(@Payload('id', ParseIntPipe) id: number) {
        return this.productsService.remove(id);
    }

    @MessagePattern({ cmd: 'search_products' })
    search(@Payload() payload: { query: string; options: PaginationOptions }) {
        return this.productsService.search(payload.query, payload.options);
    }

    @MessagePattern({ cmd: 'update_product_stock' })
    updateStock(@Payload() payload: { id: number; quantity: number }) {
        return this.productsService.updateStock(payload.id, payload.quantity);
    }
}