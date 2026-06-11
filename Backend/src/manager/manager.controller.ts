import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ManagerService } from './manager.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // I need to create this or check if it exists
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('manager')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('manager')
export class ManagerController {
  constructor(private managerService: ManagerService) {}

  @Get('inventory')
  getInventory() {
    return this.managerService.getInventory();
  }

  @Get('orders')
  getOrders() {
    return this.managerService.getOrders();
  }

  @Get('revenue')
  getRevenue() {
    return this.managerService.getRevenue();
  }

  @Post('product/:id')
  updateProduct(@Param('id') id: string, @Body() body: any) {
    return this.managerService.updateProduct(+id, body);
  }
}
