import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.productsService.findAll({
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      branchId,
    });
  }

  @Get('discounted')
  async findDiscounted(@Query('branchId') branchId?: string) {
    return this.productsService.findDiscounted(branchId);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('branchId') branchId?: string,
  ) {
    return this.productsService.findOne(id, branchId);
  }

  @Get('category/:category')
  async findByCategory(
    @Param('category') category: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.productsService.findByCategory(category, branchId);
  }
}
