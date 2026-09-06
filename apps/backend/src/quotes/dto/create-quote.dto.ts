import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PriceLabel } from '../../generated/prisma/enums.js';
export class CreateQuoteDto {
  @IsString()
  @IsNotEmpty()
  customerId: string;

  // Auto-generated if omitted.
  @IsOptional()
  @IsString()
  quoteNumber?: string;

  // Decides which product price tier is used for catalog items on this
  // quote, e.g. SPECIAL_PRICE -> "special price" quote.
  @IsOptional()
  @IsEnum(PriceLabel)
  label?: PriceLabel;

  // Total value of the appliances/load the customer wants to power.
  @IsOptional()
  @IsNumber()
  loadProfileTotal?: number;

  @IsOptional()
  @IsString()
  loadProfileNotes?: string;

  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
