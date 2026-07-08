import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AIService, ChatMessage } from './ai.service';

@Controller('ai')
export class AIController {
  constructor(private aiService: AIService) {}

  @Post('search')
  @HttpCode(200)
  async search(@Body() body: { query: string; branchId?: string }) {
    const { query, branchId } = body;
    if (!query || query.trim() === '') {
      return { products: [], message: '' };
    }
    return this.aiService.searchProducts(query.trim(), branchId);
  }

  @Post('chat')
  @HttpCode(200)
  async chat(@Body() body: { messages?: ChatMessage[]; history?: ChatMessage[] }) {
    const messages = body.messages ?? body.history ?? [];
    if (!Array.isArray(messages) || messages.length === 0) {
      return { reply: 'Please send a message to get started.' };
    }
    const reply = await this.aiService.chat(messages);
    return { reply };
  }
}
