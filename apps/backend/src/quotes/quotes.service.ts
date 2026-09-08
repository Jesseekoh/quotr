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
import { CreateSectionDto } from './dto/create-section.dto.js';
import { UpdateSectionDto } from './dto/update-section.dto.js';
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
  quoteSections: {
    orderBy: { sortOrder: 'asc' as const },
    include: {
      items: { orderBy: { sortOrder: 'asc' as const } },
      options: {
        orderBy: { sortOrder: 'asc' as const },
        include: { items: { orderBy: { sortOrder: 'asc' as const } } },
      },
    },
  },
};

@Injectable()
export class QuotesService {
  constructor(private prisma: PrismaService) {}

  // ---------------------------------------------------------------------
  // Quotes
  // ---------------------------------------------------------------------

  async create(userId: string, dto: CreateQuoteDto) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: dto.customerId, userId },
    });
    if (!customer)
      throw new NotFoundException(`Customer ${dto.customerId} not found`);

    const quote = await this.prisma.quote.create({
      data: {
        userId,
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

  findAll(userId: string) {
    return this.prisma.quote.findMany({
      where: { userId },
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const quote = await this.prisma.quote.findFirst({
      where: { id, userId },
      include: QUOTE_INCLUDE,
    });
    if (!quote) throw new NotFoundException(`Quote ${id} not found`);
    return this.attachSummary(quote);
  }

  async update(userId: string, id: string, dto: UpdateQuoteDto) {
    const existing = await this.prisma.quote.findFirst({
      where: { id, userId },
    });
    if (!existing) throw new NotFoundException(`Quote ${id} not found`);

    if (dto.customerId) {
      const customer = await this.prisma.customer.findFirst({
        where: { id: dto.customerId, userId },
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
      await this.recalculatePricesForLabel(userId, id, dto.label);
    }

    return this.findOne(userId, id);
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.quote.delete({ where: { id, userId } });
  }

  private async recalculatePricesForLabel(
    userId: string,
    quoteId: string,
    label: PriceLabel,
  ) {
    const items = await this.prisma.quoteItem.findMany({
      where: { quote: { id: quoteId, userId }, productId: { not: null } },
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

  async addOption(userId: string, quoteId: string, dto: CreateOptionDto) {
    await this.findQuoteOrThrow(userId, quoteId);
    if (!dto.quoteSectionId) {
      throw new BadRequestException('quoteSectionId is required');
    }
    if (dto.quoteSectionId) {
      await this.findSectionOrThrow(userId, quoteId, dto.quoteSectionId);
    }
    await this.prisma.quoteOption.create({
      data: {
        quoteId,
        quoteSectionId: dto.quoteSectionId ?? null,
        name: dto.name,
        description: dto.description,
        isDefault: dto.isDefault ?? false,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
    return this.findOne(userId, quoteId);
  }

  async updateOption(
    userId: string,
    quoteId: string,
    optionId: string,
    dto: UpdateOptionDto,
  ) {
    await this.findOptionOrThrow(userId, quoteId, optionId);
    if (dto.quoteSectionId) {
      await this.findSectionOrThrow(userId, quoteId, dto.quoteSectionId);
    }
    await this.prisma.quoteOption.update({
      where: { id: optionId },
      data: dto,
    });
    return this.findOne(userId, quoteId);
  }

  async removeOption(userId: string, quoteId: string, optionId: string) {
    await this.findOptionOrThrow(userId, quoteId, optionId);
    await this.prisma.quoteOption.delete({ where: { id: optionId } });
    return this.findOne(userId, quoteId);
  }

  private async findOptionOrThrow(
    userId: string,
    quoteId: string,
    optionId: string,
  ) {
    const option = await this.prisma.quoteOption.findFirst({
      where: { id: optionId, quote: { id: quoteId, userId } },
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

  async addItem(userId: string, quoteId: string, dto: CreateItemDto) {
    const quote = await this.findQuoteOrThrow(userId, quoteId);

    if (!dto.quoteSectionId) {
      throw new BadRequestException('quoteSectionId is required');
    }

    if (dto.quoteOptionId) {
      await this.findOptionOrThrow(userId, quoteId, dto.quoteOptionId);
    }
    if (dto.quoteSectionId) {
      await this.findSectionOrThrow(userId, quoteId, dto.quoteSectionId);
    }

    const data = await this.buildItemData(userId, quote, dto);

    await this.prisma.quoteItem.create({
      data: {
        quoteId,
        quoteOptionId: dto.quoteOptionId ?? null,
        quoteSectionId: dto.quoteSectionId ?? null,
        ...data,
      },
    });

    return this.findOne(userId, quoteId);
  }

  async updateItem(
    userId: string,
    quoteId: string,
    itemId: string,
    dto: UpdateItemDto,
  ) {
    const quote = await this.findQuoteOrThrow(userId, quoteId);
    const item = await this.findItemOrThrow(userId, quoteId, itemId);

    if (dto.quoteOptionId) {
      await this.findOptionOrThrow(userId, quoteId, dto.quoteOptionId);
    }
    if (dto.quoteSectionId) {
      await this.findSectionOrThrow(userId, quoteId, dto.quoteSectionId);
    }

    const merged: CreateItemDto = {
      quoteOptionId: dto.quoteOptionId,
      quoteSectionId:
        dto.quoteSectionId !== undefined
          ? dto.quoteSectionId
          : (item.quoteSectionId ?? undefined),
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

    const data = await this.buildItemData(userId, quote, merged, {
      isUpdate: true,
    });

    await this.prisma.quoteItem.update({
      where: { id: itemId },
      data: {
        ...data,
        // Only touch quoteOptionId if the caller explicitly sent it.
        ...(dto.quoteOptionId !== undefined
          ? { quoteOptionId: dto.quoteOptionId || null }
          : {}),
        ...(dto.quoteSectionId !== undefined
          ? { quoteSectionId: dto.quoteSectionId || null }
          : {}),
      },
    });

    return this.findOne(userId, quoteId);
  }

  async removeItem(userId: string, quoteId: string, itemId: string) {
    await this.findItemOrThrow(userId, quoteId, itemId);
    await this.prisma.quoteItem.delete({ where: { id: itemId } });
    return this.findOne(userId, quoteId);
  }

  async addSection(userId: string, quoteId: string, dto: CreateSectionDto) {
    await this.findQuoteOrThrow(userId, quoteId);
    await this.prisma.quoteSection.create({
      data: {
        quoteId,
        name: dto.name,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
    return this.findOne(userId, quoteId);
  }

  async updateSection(
    userId: string,
    quoteId: string,
    sectionId: string,
    dto: UpdateSectionDto,
  ) {
    await this.findSectionOrThrow(userId, quoteId, sectionId);
    await this.prisma.quoteSection.update({
      where: { id: sectionId },
      data: dto,
    });
    return this.findOne(userId, quoteId);
  }

  async removeSection(userId: string, quoteId: string, sectionId: string) {
    await this.findSectionOrThrow(userId, quoteId, sectionId);
    const [itemCount, optionCount] = await Promise.all([
      this.prisma.quoteItem.count({ where: { quoteSectionId: sectionId } }),
      this.prisma.quoteOption.count({ where: { quoteSectionId: sectionId } }),
    ]);
    if (itemCount > 0 || optionCount > 0) {
      throw new BadRequestException('Only empty sections can be removed');
    }
    await this.prisma.quoteSection.delete({ where: { id: sectionId } });
    return this.findOne(userId, quoteId);
  }

  private async findItemOrThrow(
    userId: string,
    quoteId: string,
    itemId: string,
  ) {
    const item = await this.prisma.quoteItem.findFirst({
      where: { id: itemId, quote: { id: quoteId, userId } },
    });
    if (!item)
      throw new NotFoundException(
        `Item ${itemId} not found on quote ${quoteId}`,
      );
    return item;
  }

  private async findSectionOrThrow(
    userId: string,
    quoteId: string,
    sectionId: string,
  ) {
    const section = await this.prisma.quoteSection.findFirst({
      where: { id: sectionId, quote: { id: quoteId, userId } },
    });
    if (!section)
      throw new NotFoundException(
        `Section ${sectionId} not found on quote ${quoteId}`,
      );
    return section;
  }

  private async findQuoteOrThrow(userId: string, quoteId: string) {
    const quote = await this.prisma.quote.findFirst({
      where: { id: quoteId, userId },
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
    userId: string,
    quote: { label: PriceLabel },
    dto: CreateItemDto,
    opts: { isUpdate?: boolean } = {},
  ): Promise<
    Omit<Prisma.QuoteItemUncheckedCreateInput, 'quoteId' | 'quoteOptionId'>
  > {
    const quantity = dto.quantity ?? 1;

    if (dto.productId) {
      const product = await this.prisma.product.findFirst({
        where: { id: dto.productId, userId },
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
