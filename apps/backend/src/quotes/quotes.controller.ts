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
import { Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  create(
    @Session() session: UserSession,
    @Body() createQuoteDto: CreateQuoteDto,
  ) {
    return this.quotesService.create(session.user.id, createQuoteDto);
  }

  @Get()
  findAll(@Session() session: UserSession) {
    return this.quotesService.findAll(session.user.id);
  }

  @Get(':id')
  findOne(@Session() session: UserSession, @Param('id') id: string) {
    return this.quotesService.findOne(session.user.id, id);
  }

  @Patch(':id')
  update(
    @Session() session: UserSession,
    @Param('id') id: string,
    @Body() updateQuoteDto: UpdateQuoteDto,
  ) {
    return this.quotesService.update(session.user.id, id, updateQuoteDto);
  }

  @Delete(':id')
  remove(@Session() session: UserSession, @Param('id') id: string) {
    return this.quotesService.remove(session.user.id, id);
  }

  @Post(':id/options')
  addOption(
    @Session() session: UserSession,
    @Param('id') id: string,
    @Body() dto: CreateOptionDto,
  ) {
    return this.quotesService.addOption(session.user.id, id, dto);
  }

  @Patch(':id/options/:optionId')
  updateOption(
    @Session() session: UserSession,
    @Param('id') id: string,
    @Param('optionId') optionId: string,
    @Body() dto: UpdateOptionDto,
  ) {
    return this.quotesService.updateOption(session.user.id, id, optionId, dto);
  }

  @Delete(':id/options/:optionId')
  removeOption(
    @Session() session: UserSession,
    @Param('id') id: string,
    @Param('optionId') optionId: string,
  ) {
    return this.quotesService.removeOption(session.user.id, id, optionId);
  }

  @Post(':id/items')
  addItem(
    @Session() session: UserSession,
    @Param('id') id: string,
    @Body() dto: CreateItemDto,
  ) {
    return this.quotesService.addItem(session.user.id, id, dto);
  }

  @Patch(':id/items/:itemId')
  updateItem(
    @Session() session: UserSession,
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateItemDto,
  ) {
    return this.quotesService.updateItem(session.user.id, id, itemId, dto);
  }

  @Delete(':id/items/:itemId')
  removeItem(
    @Session() session: UserSession,
    @Param('id') id: string,
    @Param('itemId') itemId: string,
  ) {
    return this.quotesService.removeItem(session.user.id, id, itemId);
  }

  @Post(':id/sections')
  addSection(
    @Session() session: UserSession,
    @Param('id') id: string,
    @Body() dto: CreateSectionDto,
  ) {
    return this.quotesService.addSection(session.user.id, id, dto);
  }

  @Patch(':id/sections/:sectionId')
  updateSection(
    @Session() session: UserSession,
    @Param('id') id: string,
    @Param('sectionId') sectionId: string,
    @Body() dto: UpdateSectionDto,
  ) {
    return this.quotesService.updateSection(
      session.user.id,
      id,
      sectionId,
      dto,
    );
  }

  @Delete(':id/sections/:sectionId')
  removeSection(
    @Session() session: UserSession,
    @Param('id') id: string,
    @Param('sectionId') sectionId: string,
  ) {
    return this.quotesService.removeSection(session.user.id, id, sectionId);
  }
}
