import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SavedItemsService } from './saved-items.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('saved-items')
@UseGuards(JwtAuthGuard)
export class SavedItemsController {
  constructor(private readonly savedItemsService: SavedItemsService) {}

  /** GET /saved-items — list all saved items for the authenticated user */
  @Get()
  findAll(@Request() req) {
    return this.savedItemsService.findAll(req.user.userId);
  }

  /** POST /saved-items  body: { productId: number } */
  @Post()
  save(@Request() req, @Body('productId', ParseIntPipe) productId: number) {
    return this.savedItemsService.save(req.user.userId, productId);
  }

  /** DELETE /saved-items/:productId */
  @Delete(':productId')
  remove(@Request() req, @Param('productId', ParseIntPipe) productId: number) {
    return this.savedItemsService.remove(req.user.userId, productId);
  }
}
