import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateQuoteDto } from './dto/create-quote.dto.js';
import { UpdateQuoteDto } from './dto/update-quote.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { PriceLabel } from '../generated/prisma/enums.js';
import { getProductPriceForLabel } from '../common/price.utils.js';
import { CreateOptionDto } from './dto/create-option.dto.js';
import { UpdateOptionDto } from './dto/update-option.dto.js';
import { CreateItemDto } from './dto/create-item.dto.js';
import { UpdateItemDto } from './dto/update-item.dto.js';
import { Decimal } from '@prisma/client/runtime/client';
import { Prisma, Quote } from '../generated/prisma/client.js';
import { QuoteOrderByWithRelationInput } from '../generated/prisma/models.js';
const QUOTE_INCLUDE = {
  customer: true,
  items: {
    where: { quoteOptionId: null },
    orderBy: { sortOrder: 'asc' as const },
  },
  options: {
    orderBy: { sortOrder: 'asc' as const },
    include: { items: { orderBy: { sortOrder: 'asc' as const } } },
  },
};

@Injectable()
export class QuotesService {
  constructor(private prisma: PrismaService) {}

  // ---------------------------------------------------------------------
  // Quotes
  // ---------------------------------------------------------------------

  async create(dto: CreateQuoteDto) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: dto.customerId },
    });
    if (!customer)
      throw new NotFoundException(`Customer ${dto.customerId} not found`);

    const quote = await this.prisma.quote.create({
      data: {
        customerId: dto.customerId,
        quoteNumber: dto.quoteNumber ?? this.generateQuoteNumber(),
        label: dto.label ?? PriceLabel.ENDUSER_PRICE,
        loadProfileTotal: dto.loadProfileTotal,
        loadProfileNotes: dto.loadProfileNotes,
        paymentTerms: dto.paymentTerms,
        notes: dto.notes,
      },
      include: QUOTE_INCLUDE,
    });

    return this.attachSummary(quote);
  }

  findAll() {
    return this.prisma.quote.findMany({
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const quote = await this.prisma.quote.findUnique({
      where: { id },
      include: QUOTE_INCLUDE,
    });
    if (!quote) throw new NotFoundException(`Quote ${id} not found`);
    return this.attachSummary(quote);
  }

  async update(id: string, dto: UpdateQuoteDto) {
    const existing = await this.prisma.quote.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Quote ${id} not found`);

    if (dto.customerId) {
      const customer = await this.prisma.customer.findUnique({
        where: { id: dto.customerId },
      });
      if (!customer)
        throw new NotFoundException(`Customer ${dto.customerId} not found`);
    }

    await this.prisma.quote.update({
      where: { id },
      data: {
        customerId: dto.customerId,
        quoteNumber: dto.quoteNumber,
        label: dto.label,
        status: dto.status,
        loadProfileTotal: dto.loadProfileTotal,
        loadProfileNotes: dto.loadProfileNotes,
        paymentTerms: dto.paymentTerms,
        notes: dto.notes,
      },
    });

    // If the price label changed, re-snapshot the price of every catalog
    // item (freeform items are left untouched) so the quote reflects the
    // new tier, e.g. switching from "resale price" to "special price".
    if (dto.label && dto.label !== existing.label) {
      await this.recalculatePricesForLabel(id, dto.label);
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.quote.delete({ where: { id } });
  }

  private async recalculatePricesForLabel(quoteId: string, label: PriceLabel) {
    const items = await this.prisma.quoteItem.findMany({
      where: { quoteId, productId: { not: null } },
      include: { product: true },
    });

    await this.prisma.$transaction(
      items
        .filter((item) => item.product)
        .map((item) => {
          const unitPrice = getProductPriceForLabel(item.product!, label);
          const totalPrice = unitPrice.mul(item.quantity);
          return this.prisma.quoteItem.update({
            where: { id: item.id },
            data: { unitPrice, totalPrice },
          });
        }),
    );
  }

  private generateQuoteNumber() {
    const now = new Date();
    const stamp = now
      .toISOString()
      .replace(/[-:T.]/g, '')
      .slice(0, 14);
    return `Q-${stamp}`;
  }

  // ---------------------------------------------------------------------
  // Summary: per-option totals + overall min/max, computed on read.
  // ---------------------------------------------------------------------

  private attachSummary(quote: Quote & { options: any[]; items: any[] }) {
    const commonItemsTotal = (quote.items ?? []).reduce(
      (sum: number, item: any) => sum + Number(item.totalPrice),
      0,
    );

    const options = (quote.options ?? []).map((option: any) => {
      const optionItemsTotal = (option.items ?? []).reduce(
        (sum: number, item: any) => sum + Number(item.totalPrice),
        0,
      );
      return {
        ...option,
        optionItemsTotal,
        grandTotal: commonItemsTotal + optionItemsTotal,
      };
    });

    const grandTotals = options.length
      ? options.map((o) => o.grandTotal)
      : [commonItemsTotal];

    return {
      ...quote,
      options,
      summary: {
        commonItemsTotal,
        minTotal: Math.min(...grandTotals),
        maxTotal: Math.max(...grandTotals),
      },
    };
  }

  // ---------------------------------------------------------------------
  // Options (e.g. "Battery Option A/B/C/D")
  // ---------------------------------------------------------------------

  async addOption(quoteId: string, dto: CreateOptionDto) {
    await this.findQuoteOrThrow(quoteId);
    await this.prisma.quoteOption.create({
      data: {
        quoteId,
        name: dto.name,
        description: dto.description,
        isDefault: dto.isDefault ?? false,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
    return this.findOne(quoteId);
  }

  async updateOption(quoteId: string, optionId: string, dto: UpdateOptionDto) {
    await this.findOptionOrThrow(quoteId, optionId);
    await this.prisma.quoteOption.update({
      where: { id: optionId },
      data: dto,
    });
    return this.findOne(quoteId);
  }

  async removeOption(quoteId: string, optionId: string) {
    await this.findOptionOrThrow(quoteId, optionId);
    await this.prisma.quoteOption.delete({ where: { id: optionId } });
    return this.findOne(quoteId);
  }

  private async findOptionOrThrow(quoteId: string, optionId: string) {
    const option = await this.prisma.quoteOption.findFirst({
      where: { id: optionId, quoteId },
    });
    if (!option)
      throw new NotFoundException(
        `Option ${optionId} not found on quote ${quoteId}`,
      );
    return option;
  }

  // ---------------------------------------------------------------------
  // Items (typed-in, or picked from the product catalog)
  // ---------------------------------------------------------------------

  async addItem(quoteId: string, dto: CreateItemDto) {
    const quote = await this.findQuoteOrThrow(quoteId);

    if (dto.quoteOptionId) {
      await this.findOptionOrThrow(quoteId, dto.quoteOptionId);
    }

    const data = await this.buildItemData(quote, dto);

    await this.prisma.quoteItem.create({
      data: { quoteId, quoteOptionId: dto.quoteOptionId ?? null, ...data },
    });

    return this.findOne(quoteId);
  }

  async updateItem(quoteId: string, itemId: string, dto: UpdateItemDto) {
    const quote = await this.findQuoteOrThrow(quoteId);
    const item = await this.findItemOrThrow(quoteId, itemId);

    if (dto.quoteOptionId) {
      await this.findOptionOrThrow(quoteId, dto.quoteOptionId);
    }

    const merged: CreateItemDto = {
      quoteOptionId: dto.quoteOptionId,
      productId:
        dto.productId !== undefined
          ? dto.productId
          : (item.productId ?? undefined),
      description: dto.description ?? item.description,
      brand: dto.brand ?? item.brand ?? undefined,
      specification: dto.specification ?? item.specification ?? undefined,
      category: dto.category ?? item.category ?? undefined,
      quantity: dto.quantity ?? item.quantity,
      unit: dto.unit ?? item.unit ?? undefined,
      unitPrice:
        dto.unitPrice !== undefined ? dto.unitPrice : Number(item.unitPrice),
      sortOrder: dto.sortOrder ?? item.sortOrder,
    };

    const data = await this.buildItemData(quote, merged, { isUpdate: true });

    await this.prisma.quoteItem.update({
      where: { id: itemId },
      data: {
        ...data,
        // Only touch quoteOptionId if the caller explicitly sent it.
        ...(dto.quoteOptionId !== undefined
          ? { quoteOptionId: dto.quoteOptionId || null }
          : {}),
      },
    });

    return this.findOne(quoteId);
  }

  async removeItem(quoteId: string, itemId: string) {
    await this.findItemOrThrow(quoteId, itemId);
    await this.prisma.quoteItem.delete({ where: { id: itemId } });
    return this.findOne(quoteId);
  }

  private async findItemOrThrow(quoteId: string, itemId: string) {
    const item = await this.prisma.quoteItem.findFirst({
      where: { id: itemId, quoteId },
    });
    if (!item)
      throw new NotFoundException(
        `Item ${itemId} not found on quote ${quoteId}`,
      );
    return item;
  }

  private async findQuoteOrThrow(quoteId: string) {
    const quote = await this.prisma.quote.findUnique({
      where: { id: quoteId },
    });
    if (!quote) throw new NotFoundException(`Quote ${quoteId} not found`);
    return quote;
  }

  /**
   * Resolves the description/brand/specification/category/unitPrice for a
   * quote item, either from a catalog product (priced per the quote's
   * label) or from the freeform fields the user typed in.
   */
  private async buildItemData(
    quote: { label: PriceLabel },
    dto: CreateItemDto,
    opts: { isUpdate?: boolean } = {},
  ): Promise<
    Omit<Prisma.QuoteItemUncheckedCreateInput, 'quoteId' | 'quoteOptionId'>
  > {
    const quantity = dto.quantity ?? 1;

    if (dto.productId) {
      const product = await this.prisma.product.findUnique({
        where: { id: dto.productId },
      });
      if (!product)
        throw new NotFoundException(`Product ${dto.productId} not found`);

      const catalogPrice = getProductPriceForLabel(product, quote.label);
      // Allow an explicit unitPrice override (e.g. manual discount on this
      // line only); otherwise use the catalog price for the quote's label.
      const unitPrice =
        dto.unitPrice !== undefined ? new Decimal(dto.unitPrice) : catalogPrice;
      const totalPrice = unitPrice.mul(quantity);

      return {
        productId: product.id,
        description: dto.description ?? product.name,
        brand: dto.brand ?? product.brand,
        specification: dto.specification ?? product.specification,
        category: dto.category ?? product.category,
        quantity,
        unit: dto.unit ?? product.unit ?? 'pcs',
        unitPrice,
        totalPrice,
        sortOrder: dto.sortOrder ?? 0,
      };
    }

    // Freeform item: description + unitPrice are required.
    if (!dto.description) {
      throw new BadRequestException(
        'description is required when productId is not provided',
      );
    }
    if (dto.unitPrice === undefined) {
      throw new BadRequestException(
        'unitPrice is required when productId is not provided',
      );
    }

    const unitPrice = new Decimal(dto.unitPrice);
    const totalPrice = unitPrice.mul(quantity);

    return {
      productId: null,
      description: dto.description,
      brand: dto.brand,
      specification: dto.specification,
      category: dto.category,
      quantity,
      unit: dto.unit ?? 'pcs',
      unitPrice,
      totalPrice,
      sortOrder: dto.sortOrder ?? 0,
    };
  }
}
