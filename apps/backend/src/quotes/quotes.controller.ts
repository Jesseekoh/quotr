import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { QuotesService } from './quotes.service.js';
import { CreateQuoteDto } from './dto/create-quote.dto.js';
import { UpdateQuoteDto } from './dto/update-quote.dto.js';
import { CreateOptionDto } from './dto/create-option.dto.js';
import { UpdateOptionDto } from './dto/update-option.dto.js';
import { CreateItemDto } from './dto/create-item.dto.js';
import { UpdateItemDto } from './dto/update-item.dto.js';
import { CreateSectionDto } from './dto/create-section.dto.js';
import { UpdateSectionDto } from './dto/update-section.dto.js';
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  create(@Body() createQuoteDto: CreateQuoteDto) {
    return this.quotesService.create(createQuoteDto);
  }

  @Get()
  findAll() {
    return this.quotesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quotesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQuoteDto: UpdateQuoteDto) {
    return this.quotesService.update(id, updateQuoteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.quotesService.remove(id);
  }

  @Post(':id/options')
  addOption(@Param('id') id: string, @Body() dto: CreateOptionDto) {
    return this.quotesService.addOption(id, dto);
  }

  @Patch(':id/options/:optionId')
  updateOption(
    @Param('id') id: string,
    @Param('optionId') optionId: string,
    @Body() dto: UpdateOptionDto,
  ) {
    return this.quotesService.updateOption(id, optionId, dto);
  }

  @Delete(':id/options/:optionId')
  removeOption(@Param('id') id: string, @Param('optionId') optionId: string) {
    return this.quotesService.removeOption(id, optionId);
  }

  @Post(':id/items')
  addItem(@Param('id') id: string, @Body() dto: CreateItemDto) {
    return this.quotesService.addItem(id, dto);
  }

  @Patch(':id/items/:itemId')
  updateItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateItemDto,
  ) {
    return this.quotesService.updateItem(id, itemId, dto);
  }

  @Delete(':id/items/:itemId')
  removeItem(@Param('id') id: string, @Param('itemId') itemId: string) {
    return this.quotesService.removeItem(id, itemId);
  }

  @Post(':id/sections')
  addSection(@Param('id') id: string, @Body() dto: CreateSectionDto) {
    return this.quotesService.addSection(id, dto);
  }

  @Patch(':id/sections/:sectionId')
  updateSection(
    @Param('id') id: string,
    @Param('sectionId') sectionId: string,
    @Body() dto: UpdateSectionDto,
  ) {
    return this.quotesService.updateSection(id, sectionId, dto);
  }

  @Delete(':id/sections/:sectionId')
  removeSection(
    @Param('id') id: string,
    @Param('sectionId') sectionId: string,
  ) {
    return this.quotesService.removeSection(id, sectionId);
  }
}
