import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const STOP_WORDS = new Set([
  'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'she', 'it', 'they',
  'need', 'want', 'would', 'could', 'should', 'can', 'will', 'shall',
  'a', 'an', 'the', 'this', 'that', 'these', 'those',
  'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did',
  'with', 'some', 'any', 'all', 'each', 'every', 'no', 'not',
  'and', 'or', 'but', 'if', 'because', 'as', 'until', 'while',
  'of', 'at', 'by', 'for', 'about', 'against', 'between',
  'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over',
  'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how',
  'get', 'got', 'just', 'also', 'very', 'too', 'please', 'help',
  'total', 'cost', 'should', 'not', 'exceed', 'price', 'show', 'find',
  'looking', 'like', 'want', 'some', 'items', 'products',
  'appear', 'according', 'accordingly', 'give', 'me',
  'foods', 'food',
]);

const PRICE_WORDS = new Set([
  'rwf', 'frw', 'francs', 'frs', 'r', 'under', 'over', 'less', 'more',
  'exceed', 'budget', 'cost', 'price', 'total', 'spend', 'cheap', 'expensive',
]);

@Injectable()
export class AIService {
  constructor(private prisma: PrismaService) {}

  async searchProducts(query: string) {
    try {
      const filters = this.parseQuery(query);
      const where: any = {};

      // Build OR conditions: each keyword matches name OR category
      const orConditions: any[] = [];

      for (const kw of filters.keywords) {
        orConditions.push(
          { name: { contains: kw } },
          { category: { contains: kw } },
        );
      }

      if (orConditions.length > 0) {
        where.OR = orConditions;
      }

      // Price
      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        where.price = {};
        if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
        if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
      }

      // Stock
      if (filters.inStock !== undefined) {
        where.inStock = filters.inStock;
      }

      const products = await this.prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          price: true,
          stockQuantity: true,
          category: true,
          inStock: true,
          description: true,
          image: true,
        },
        orderBy: { name: 'asc' },
        take: 50,
      });

      return products;
    } catch (error) {
      console.error('AI search error, falling back:', error);
      return this.prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { category: { contains: query } },
          ],
        },
        select: {
          id: true,
          name: true,
          price: true,
          stockQuantity: true,
          category: true,
          inStock: true,
          description: true,
          image: true,
        },
        orderBy: { name: 'asc' },
        take: 50,
      });
    }
  }

  private parseQuery(text: string): {
    keywords: string[];
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
  } {
    const lower = text.toLowerCase().trim();
    let minPrice: number | undefined;
    let maxPrice: number | undefined;
    let inStock: boolean | undefined;

    // 1. Extract price
    const priceResult = this.extractPrice(lower);
    minPrice = priceResult.minPrice;
    maxPrice = priceResult.maxPrice;
    let remaining = priceResult.remaining;

    // 2. Extract stock
    if (/\bin stock\b|\bavailable\b|\binventory\b/i.test(remaining)) {
      inStock = true;
      remaining = remaining.replace(/\bin stock\b|\bavailable\b|\binventory\b/gi, '');
    }

    // 3. Extract keywords
    const words = remaining
      .split(/[\s,]+/)
      .map(w => w.replace(/[^a-zA-Z0-9À-ÿ-]/g, ''))
      .filter(w => w.length > 1);

    const keywords = Array.from(new Set(
      words.filter(w => !this.isStopWord(w) && !PRICE_WORDS.has(w) && !/^\d+$/.test(w))
    ));

    return { keywords, minPrice, maxPrice, inStock };
  }

  private extractPrice(text: string): {
    minPrice?: number;
    maxPrice?: number;
    remaining: string;
  } {
    let remaining = text;
    let minPrice: number | undefined;
    let maxPrice: number | undefined;

    // between X and Y / from X to Y
    const range = remaining.match(
      /(?:between|from|range)\s+(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:and|to|-)\s*(\d+(?:,\d{3})*(?:\.\d+)?)/i
    );
    if (range) {
      minPrice = this.parseNum(range[1]);
      maxPrice = this.parseNum(range[2]);
      remaining = remaining.replace(range[0], '');
    }

    // under X / less than X / below X / max X / not exceed X / cheaper than X / at most X
    const maxP = remaining.match(
      /(?:under|less than|below|max(?:imum)?|at most|not exceed|cheaper than|budget|spend)\s*(?:is\s*)?(\d+(?:,\d{3})*(?:\.\d+)?)/i
    );
    if (maxP && maxPrice === undefined) {
      maxPrice = this.parseNum(maxP[1]);
      remaining = remaining.replace(maxP[0], '');
    }

    // "cost should not exceed X"
    const costMax = remaining.match(
      /(?:cost|price|total)\s*(?:should\s*)?(?:not\s*)?(?:exceed|be|is)\s*(?:more than|under|below|less than)?\s*(\d+(?:,\d{3})*(?:\.\d+)?)/i
    );
    if (costMax && maxPrice === undefined) {
      maxPrice = this.parseNum(costMax[1]);
      remaining = remaining.replace(costMax[0], '');
    }

    // number + rwf/frw/francs
    const currency = remaining.match(
      /(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:rwf|frw|francs?|frs|r\b)/i
    );
    if (currency && maxPrice === undefined) {
      maxPrice = this.parseNum(currency[1]);
      remaining = remaining.replace(currency[0], '');
    }

    // over X / more than X / above X / at least X / min X
    const minP = remaining.match(
      /(?:over|more than|above|min(?:imum)?|at least)\s*(?:is\s*)?(\d+(?:,\d{3})*(?:\.\d+)?)/i
    );
    if (minP && minPrice === undefined) {
      minPrice = this.parseNum(minP[1]);
      remaining = remaining.replace(minP[0], '');
    }

    // < X or > X
    const lt = remaining.match(/<\s*(\d+(?:,\d{3})*(?:\.\d+)?)/);
    if (lt && maxPrice === undefined) {
      maxPrice = this.parseNum(lt[1]);
      remaining = remaining.replace(lt[0], '');
    }

    const gt = remaining.match(/>\s*(\d+(?:,\d{3})*(?:\.\d+)?)/);
    if (gt && minPrice === undefined) {
      minPrice = this.parseNum(gt[1]);
      remaining = remaining.replace(gt[0], '');
    }

    return { minPrice, maxPrice, remaining };
  }

  private parseNum(s: string): number {
    return parseFloat(s.replace(/,/g, ''));
  }

  private isStopWord(w: string): boolean {
    return STOP_WORDS.has(w);
  }
}
