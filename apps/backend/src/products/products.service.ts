import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductDto) {
    return this.prisma.product.create({ data: dto });
  }

  async findOne(id: string) {
    try {
      const product = await this.prisma.product.findFirstOrThrow({
        where: { id, isActive: true },
      });

      return product;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Product with ${id} not found`);
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.product.findMany({ where: { isActive: true } });
  }

  async update(id: string, dto: UpdateProductDto) {
    try {
      return await this.prisma.product.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Product with ${id} not found`);
      }

      throw error;
    }
  }

  async softDelete(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    // Product has never existed
    if (!product) {
      throw new NotFoundException(`Product with ${id} not found`);
    }

    if (!product.isActive) {
      return;
    }

    // Product exists and is active
    await this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
