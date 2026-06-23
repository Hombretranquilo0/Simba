import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AIService } from './ai.service';

@Controller('ai')
export class AIController {
  constructor(private aiService: AIService) {}

  @Post('search')
  @HttpCode(200)
  async search(@Body() body: { query: string }) {
    const { query } = body;
    if (!query || query.trim() === '') {
      return [];
    }
    return this.aiService.searchProducts(query.trim());
  }
}