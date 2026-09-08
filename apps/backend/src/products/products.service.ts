import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { Prisma, ProductCategory } from '../generated/prisma/client.js';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateProductDto) {
    return this.prisma.product.create({ data: { ...dto, userId } });
  }

  async findOne(userId: string, id: string) {
    try {
      const product = await this.prisma.product.findFirstOrThrow({
        where: { id, userId, isActive: true },
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

  async findAll(
    userId: string,
    filters?: { category?: string; search?: string },
  ) {
    const where: Prisma.ProductWhereInput = { userId, isActive: true };

    if (
      filters?.category &&
      Object.values(ProductCategory).includes(
        filters.category as ProductCategory,
      )
    ) {
      where.category = filters.category as ProductCategory;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { brand: { contains: filters.search, mode: 'insensitive' } },
        { specification: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.product.findMany({ where, orderBy: { name: 'asc' } });
  }

  async update(userId: string, id: string, dto: UpdateProductDto) {
    try {
      await this.findOne(userId, id);
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

  async softDelete(userId: string, id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, userId },
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
