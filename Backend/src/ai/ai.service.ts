import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import OpenAI from 'openai';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ParsedFilters {
  keywords: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'name_asc';
}

const STOP_WORDS = new Set([
  'i','me','my','we','our','you','your','he','she','it','they',
  'need','want','would','could','should','can','will','shall',
  'a','an','the','this','that','these','those',
  'is','are','was','were','be','been','being',
  'have','has','had','do','does','did',
  'with','some','any','all','each','every','no','not',
  'and','or','but','if','because','as','until','while',
  'of','at','by','for','about','against','between',
  'into','through','during','before','after','above','below',
  'to','from','up','down','in','out','on','off','over',
  'then','once','here','there','when','where','why','how',
  'get','got','just','also','very','too','please','help',
  'total','cost','exceed','price','show','find',
  'looking','like','want','items','products','give',
  'foods','food','stuff','things','thing',
]);

const PRICE_WORDS = new Set([
  'rwf','frw','francs','frs','r','under','over','less','more',
  'exceed','budget','cost','price','total','spend','cheap','expensive',
]);

@Injectable()
export class AIService {
  private groq: OpenAI | null = null;

  constructor(private prisma: PrismaService) {
    const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.groq = new OpenAI({
        apiKey,
        baseURL: process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1',
      });
    }
  }

  async searchProducts(query: string, branchId?: string): Promise<{ products: any[]; message: string }> {
    let filters: ParsedFilters;
    let message = '';

    // Try LLM parsing first
    if (this.groq) {
      try {
        const result = await this.parsWithLLM(query);
        filters = result.filters;
        message = result.message;
      } catch (err) {
        console.warn('LLM parse failed, using regex fallback:', (err as Error).message);
        filters = this.parseQueryRegex(query);
        message = '';
      }
    } else {
      filters = this.parseQueryRegex(query);
    }

    let products = await this.runQuery(filters, query);

    // Merge branch-specific inventory if branchId provided
    if (branchId && products.length > 0) {
      const ids = products.map((p) => p.id);
      const inventory = await this.prisma.branchInventory.findMany({
        where: { branchId, productId: { in: ids } },
      });
      const invMap = new Map(inventory.map((r) => [r.productId, r]));
      products = products.map((p) => {
        const row = invMap.get(p.id);
        return row ? { ...p, stockQuantity: row.stockQuantity, inStock: row.inStock } : p;
      });
    }

    if (!message) {
      message = this.buildFallbackMessage(query, filters, products.length);
    }

    return { products, message };
  }

  private async parsWithLLM(query: string): Promise<{ filters: ParsedFilters; message: string }> {
    const systemPrompt = `You are a shopping assistant for Simba Rwanda Supermarket. Extract search filters from the user's query and return ONLY valid JSON.

JSON shape:
{
  "keywords": string[],      // product names or categories (e.g. ["milk","bread"])
  "minPrice": number | null,  // minimum price in RWF (use for "above","over","more than","at least")
  "maxPrice": number | null,  // maximum price in RWF (use for "under","below","less than","cheap","budget")
  "inStock": boolean | null,
  "sortBy": "price_asc" | "price_desc" | "name_asc" | null,
  "message": string           // 1 warm sentence summarising what you're showing
}

Price direction rules (CRITICAL):
- "above X", "over X", "more than X", "at least X" → minPrice=X, maxPrice=null
- "under X", "below X", "less than X", "cheaper than X", "budget X" → maxPrice=X, minPrice=null
- "between X and Y" → minPrice=X, maxPrice=Y
- "cheap" / "cheapest" alone (no number) → sortBy="price_asc", no price filter

Category keyword rules:
- "breakfast" → ["egg","milk","bread","cereal","oat","yogurt","juice","banana","butter","coffee","tea"]
- "fruits" → ["fruit","apple","mango","banana","orange","avocado","pineapple","strawberry"]
- "vegetables" → ["vegetable","carrot","tomato","onion","cabbage","spinach","pepper","leek"]
- "drinks" / "beverages" → ["juice","water","soda","beer","wine","cognac","whisky","drink","beverage"]
- "spirits" / "alcohol" → ["cognac","whisky","wine","beer","spirit","rum","gin","vodka"]
- For a specific named product (e.g. "cognac") → use that exact word as the keyword

Currency: strip "RWF","FRW","francs","frw" suffixes and parse as a number.`;


    const completion = await this.groq!.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
      max_tokens: 300,
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(raw);

    return {
      filters: {
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
        minPrice: parsed.minPrice ?? undefined,
        maxPrice: parsed.maxPrice ?? undefined,
        inStock: parsed.inStock ?? undefined,
        sortBy: parsed.sortBy ?? undefined,
      },
      message: parsed.message ?? '',
    };
  }

  private async runQuery(filters: ParsedFilters, originalQuery: string): Promise<any[]> {
    try {
      const where: any = {};
      const orConditions: any[] = [];

      for (const kw of filters.keywords) {
        orConditions.push(
          { name: { contains: kw, mode: 'insensitive' } },
          { category: { contains: kw, mode: 'insensitive' } },
          { description: { contains: kw, mode: 'insensitive' } },
        );
      }

      if (orConditions.length > 0) where.OR = orConditions;

      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        where.price = {};
        if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
        if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
      }

      if (filters.inStock !== undefined) where.inStock = filters.inStock;

      const orderBy = this.buildOrderBy(filters.sortBy);

      const products = await this.prisma.product.findMany({
        where,
        select: {
          id: true, name: true, price: true, stockQuantity: true,
          category: true, inStock: true, description: true, image: true,
          discount: true, unit: true,
        },
        orderBy,
        take: 50,
      });

      // If LLM gave keywords but nothing matched, fall back to plain text search
      if (products.length === 0 && filters.keywords.length > 0) {
        return this.prisma.product.findMany({
          where: {
            OR: [
              { name: { contains: originalQuery, mode: 'insensitive' } },
              { category: { contains: originalQuery, mode: 'insensitive' } },
            ],
          },
          select: {
            id: true, name: true, price: true, stockQuantity: true,
            category: true, inStock: true, description: true, image: true,
            discount: true, unit: true,
          },
          orderBy: { name: 'asc' },
          take: 50,
        });
      }

      return products;
    } catch (err) {
      console.error('DB query error:', err);
      return [];
    }
  }

  private buildOrderBy(sortBy?: string) {
    if (sortBy === 'price_asc') return { price: 'asc' as const };
    if (sortBy === 'price_desc') return { price: 'desc' as const };
    return { name: 'asc' as const };
  }

  private buildFallbackMessage(query: string, filters: ParsedFilters, count: number): string {
    if (count === 0) return `No products found for "${query}". Try a different search.`;
    if (filters.maxPrice) return `Showing ${count} product(s) under ${filters.maxPrice.toLocaleString()} RWF.`;
    if (filters.sortBy === 'price_asc') return `Showing ${count} product(s) sorted by lowest price.`;
    return `Found ${count} product(s) for "${query}".`;
  }

  // ── Regex fallback (kept from original) ──────────────────────────────────

  private parseQueryRegex(text: string): ParsedFilters {
    const lower = text.toLowerCase().trim();
    let inStock: boolean | undefined;
    let sortBy: ParsedFilters['sortBy'];

    const priceResult = this.extractPrice(lower);
    let remaining = priceResult.remaining;

    if (/\bin stock\b|\bavailable\b/i.test(remaining)) {
      inStock = true;
      remaining = remaining.replace(/\bin stock\b|\bavailable\b/gi, '');
    }

    if (/\bcheapest\b|\blowest price\b/i.test(remaining)) sortBy = 'price_asc';
    else if (/\bmost expensive\b|\bhighest price\b/i.test(remaining)) sortBy = 'price_desc';

    const words = remaining
      .split(/[\s,]+/)
      .map(w => w.replace(/[^a-zA-Z0-9À-ÿ-]/g, ''))
      .filter(w => w.length > 1);

    const keywords = Array.from(new Set(
      words.filter(w => !STOP_WORDS.has(w) && !PRICE_WORDS.has(w) && !/^\d+$/.test(w))
    ));

    return { keywords, minPrice: priceResult.minPrice, maxPrice: priceResult.maxPrice, inStock, sortBy };
  }

  private extractPrice(text: string) {
    let remaining = text;
    let minPrice: number | undefined;
    let maxPrice: number | undefined;

    const range = remaining.match(
      /(?:between|from|range)\s+(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:and|to|-)\s*(\d+(?:,\d{3})*(?:\.\d+)?)/i
    );
    if (range) {
      minPrice = this.parseNum(range[1]);
      maxPrice = this.parseNum(range[2]);
      remaining = remaining.replace(range[0], '');
    }

    const maxP = remaining.match(
      /(?:under|less than|below|max(?:imum)?|at most|not exceed|cheaper than|budget)\s*(?:is\s*)?(\d+(?:,\d{3})*(?:\.\d+)?)/i
    );
    if (maxP && maxPrice === undefined) {
      maxPrice = this.parseNum(maxP[1]);
      remaining = remaining.replace(maxP[0], '');
    }

    const costMax = remaining.match(
      /(?:cost|price|total)\s*(?:should\s*)?(?:not\s*)?(?:exceed|be|is)\s*(?:more than|under|below|less than)?\s*(\d+(?:,\d{3})*(?:\.\d+)?)/i
    );
    if (costMax && maxPrice === undefined) {
      maxPrice = this.parseNum(costMax[1]);
      remaining = remaining.replace(costMax[0], '');
    }

    const currency = remaining.match(
      /(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:rwf|frw|francs?|frs)\b/i
    );
    if (currency && maxPrice === undefined) {
      maxPrice = this.parseNum(currency[1]);
      remaining = remaining.replace(currency[0], '');
    }

    const minP = remaining.match(
      /(?:over|more than|above|min(?:imum)?|at least)\s*(?:is\s*)?(\d+(?:,\d{3})*(?:\.\d+)?)/i
    );
    if (minP && minPrice === undefined) {
      minPrice = this.parseNum(minP[1]);
      remaining = remaining.replace(minP[0], '');
    }

    return { minPrice, maxPrice, remaining };
  }

  private parseNum(s: string): number {
    return parseFloat(s.replace(/,/g, ''));
  }

  // ── Conversational Chat ───────────────────────────────────────

  async chat(history: ChatMessage[]): Promise<string> {
    const systemPrompt = `You are Simba Assistant, the friendly and knowledgeable virtual helper for Simba Rwanda Supermarket — Rwanda's trusted supermarket since 2007.

About Simba:
- Founded in 2007, headquartered in Kigali, Rwanda.
- Carries 10,000+ products: fresh produce, food & beverages, household essentials, cosmetics, electronics, baby products, pet supplies, sports & wellness, office supplies, and more.
- Delivers across Kigali (1–3 hours) and beyond (up to 24 hours).
- Opening hours: Monday – Sunday, 7:00 AM – 9:00 PM.
- Contact: info@simbasupermarket.rw | +250 788 300 000 | +250 722 300 000
- Website: simba-shop.rw

Policies:
- Minimum order: 2,500 RWF.
- Delivery is currently FREE on all orders (limited time).
- Payment: Cash on Delivery and simulated card payment. MTN MoMo & Airtel Money coming soon.
- Returns: within 24 hours for fresh/perishable items (with photo proof). 
- Order changes or cancellations: allowed within 15 minutes of placing the order by calling support.
- Delivers on public holidays (8:00 AM – 6:00 PM). Orders after 4:00 PM on holidays delivered next day.

Your role:
- Answer questions about Simba's services, products, delivery, returns, payments, and account matters.
- Be warm, concise, and helpful. Use short paragraphs.
- If a user wants to search for specific products, tell them to use the search bar at the top of the page which has AI-powered product search.
- Never make up information. If you don't know something, say so and offer the support contact.
- Do not answer questions unrelated to Simba or general shopping assistance.
- Respond in the same language the user writes in (English, French, or Kinyarwanda).`;

    if (!this.groq) {
      return "I'm sorry, the AI assistant is temporarily unavailable. Please contact us at info@simbasupermarket.rw or call +250 788 300 000 for help.";
    }

    try {
      const completion = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          ...history.map(m => ({ role: m.role, content: m.content })),
        ],
        temperature: 0.6,
        max_tokens: 512,
      });

      return completion.choices[0]?.message?.content?.trim() ?? "I couldn't generate a response. Please try again.";
    } catch (err) {
      console.error('Chat AI error:', (err as Error).message);
      return "I'm having trouble responding right now. Please try again shortly or contact our support team.";
    }
  }
}
