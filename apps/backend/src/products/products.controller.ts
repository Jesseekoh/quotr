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
import { Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { UpdateProductDto } from './dto/update-product.dto.js';

@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @Post()
  async createProduct(
    @Session() session: UserSession,
    @Body() dto: CreateProductDto,
  ) {
    return this.productService.create(session.user.id, dto);
  }

  @Get(':id')
  async findOne(@Session() session: UserSession, @Param('id') id: string) {
    return this.productService.findOne(session.user.id, id);
  }

  @Get()
  async findAll(
    @Session() session: UserSession,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.productService.findAll(session.user.id, { category, search });
  }

  @Patch(':id')
  async update(
    @Session() session: UserSession,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productService.update(session.user.id, id, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async softDelete(@Session() session: UserSession, @Param('id') id: string) {
    return this.productService.softDelete(session.user.id, id);
  }
}
