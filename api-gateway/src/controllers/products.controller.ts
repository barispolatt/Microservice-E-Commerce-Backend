import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, Inject, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PRODUCTS_SERVICE, UserRole } from '@ecommerce/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateProductDto } from 'apps/products-microservice/src/dto/create-product.dto';
import { UpdateProductDto } from 'apps/products-microservice/src/dto/update-product.dto';

@Controller('products')
export class ProductsController {
    constructor(@Inject(PRODUCTS_SERVICE) private readonly productsClient: ClientProxy) {}

    @Get()
    findAll(@Query() query: any) {
        // Forward pagination and sorting query params
        return this.productsClient.send({ cmd: 'get_all_products' }, query);
    }

    @Get('search')
    searchProducts(@Query('q') query: string, @Query() options: any) {
        return this.productsClient.send({ cmd: 'search_products' }, { query, options });
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.productsClient.send({ cmd: 'get_product_by_id' }, { id });
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SELLER)
    create(@Body() createProductDto: CreateProductDto) {
        return this.productsClient.send({ cmd: 'create_product' }, createProductDto);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SELLER)
    update(@Param('id', ParseIntPipe) id: number, @Body() updateProductDto: UpdateProductDto) {
        return this.productsClient.send({ cmd: 'update_product' }, { id, data: updateProductDto });
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.productsClient.send({ cmd: 'delete_product' }, { id });
    }
}