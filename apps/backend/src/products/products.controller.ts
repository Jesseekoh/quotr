import {
  Controller,
  Post,
  Get,
  Body,
  Patch,
  Delete,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto.js';
import { ProductsService } from './products.service.js';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { UpdateProductDto } from './dto/update-product.dto.js';

@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @AllowAnonymous()
  @Post()
  async createProduct(@Body() dto: CreateProductDto) {
    return this.productService.create(dto);
  }

  @AllowAnonymous()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @AllowAnonymous()
  @Get()
  async findAll(
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.productService.findAll({ category, search });
  }

  @AllowAnonymous()
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productService.update(id, dto);
  }

  @AllowAnonymous()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async softDelete(@Param('id') id: string) {
    return this.productService.softDelete(id);
  }
}
