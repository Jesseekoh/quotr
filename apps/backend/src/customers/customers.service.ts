import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { UpdateCustomerDto } from './dto/update-customer.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}
  create(userId: string, dto: CreateCustomerDto) {
    return this.prisma.customer.create({ data: { ...dto, userId } });
  }

  findAll(userId: string, search?: string) {
    return this.prisma.customer.findMany({
      where: {
        userId,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { address: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, userId },
      include: {
        quotes: {
          select: { id: true, quoteNumber: true, status: true, label: true },
        },
      },
    });
    if (!customer) throw new NotFoundException(`Customer ${id} not found`);
    return customer;
  }

  async update(userId: string, id: string, dto: UpdateCustomerDto) {
    await this.findOne(userId, id);
    return this.prisma.customer.update({ where: { id }, data: dto });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.customer.delete({ where: { id } });
  }
}
