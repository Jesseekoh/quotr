import { PartialType } from '@nestjs/mapped-types';
import { QuoteStatus } from '../../generated/prisma/enums.js';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateQuoteDto } from './create-quote.dto.js';

export class UpdateQuoteDto extends PartialType(CreateQuoteDto) {
  @IsOptional()
  @IsEnum(QuoteStatus)
  status?: QuoteStatus;
}
