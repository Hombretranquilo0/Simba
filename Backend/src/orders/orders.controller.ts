import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req, @Body() body: { items: any[]; total: number }) {
    return this.ordersService.createOrder(req.user.userId, body.items, body.total);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getUserOrders(@Request() req) {
    return this.ordersService.getUserOrders(req.user.userId);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.ordersService.updateOrderStatus(+id, status);
  }
}
