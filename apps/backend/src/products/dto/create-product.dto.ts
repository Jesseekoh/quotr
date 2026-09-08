import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsObject,
  IsNumber,
  Min,
} from 'class-validator';
import { ProductCategory } from '../../generated/prisma/enums.js';
export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsEnum(ProductCategory)
  category: ProductCategory;

  // Free-text summary of the product, shown on quotes.
  @IsString()
  @IsNotEmpty()
  specification: string;

  // Optional structured specs, e.g. { "capacityKWh": 16.07, "voltage": "48VDC" }
  @IsOptional()
  @IsObject()
  technicalSpecs?: Record<string, any>;

  @IsOptional()
  @IsString()
  warranty?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsNumber()
  @Min(0)
  costPrice: number;

  @IsNumber()
  @Min(0)
  discountPrice: number;

  @IsNumber()
  @Min(0)
  resalePrice: number;

  @IsNumber()
  @Min(0)
  specialPrice: number;

  @IsNumber()
  @Min(0)
  enduserPrice: number;
}
