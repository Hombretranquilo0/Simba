import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request } from '@nestjs/common';
import { OrdersService, FulfillmentData } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Request() req,
    @Body()
    body: {
      items: { productId: number; quantity: number; price: number }[];
      total: number;
      branchId?: string;
      fulfillmentType: 'delivery' | 'pickup';
      phone?: string;
      deliveryNotes?: string;
      locationLink?: string;
      pickupName?: string;
      pickupTime?: string;
    },
  ) {
    const fulfillment: FulfillmentData = {
      fulfillmentType: body.fulfillmentType ?? 'delivery',
      phone: body.phone,
      deliveryNotes: body.deliveryNotes,
      locationLink: body.locationLink,
      pickupName: body.pickupName,
      pickupTime: body.pickupTime,
    };
    return this.ordersService.createOrder(
      req.user.userId,
      body.items,
      body.total,
      fulfillment,
      body.branchId,
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getUserOrders(@Request() req) {
    return this.ordersService.getUserOrders(req.user.userId);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager', 'super_admin')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.ordersService.updateOrderStatus(+id, status);
  }
}
