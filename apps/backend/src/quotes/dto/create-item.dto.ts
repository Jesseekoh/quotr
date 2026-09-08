import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ProductCategory } from '../../generated/prisma/enums.js';

export class CreateItemDto {
  @IsOptional()
  @IsString()
  quoteSectionId?: string | null;

  // Omit to add this item as "common" (applies to every option on the quote).
  // Set to attach it to one specific option instead (e.g. one battery choice).
  @IsOptional()
  @IsString()
  quoteOptionId?: string;

  // If set, the item's description/brand/specification/category/price are
  // pulled from this product (price depends on the quote's label).
  @IsOptional()
  @IsString()
  productId?: string;

  // Required when productId is not provided. Optional override otherwise.
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  specification?: string;

  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  // Required when productId is not provided (freeform item price).
  // If productId IS provided, this overrides the catalog price for this
  // line item only.
  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice?: number;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
