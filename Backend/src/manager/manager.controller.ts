import { Controller, Get, Post, Body, Param, UseGuards, Query, ForbiddenException, Req } from '@nestjs/common';
import { ManagerService } from './manager.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import type { Request } from 'express';

@Controller('manager')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('manager', 'super_admin')
export class ManagerController {
  constructor(private managerService: ManagerService) {}

  private getBranchId(req: Request, queryBranchId?: string): string | undefined {
    const managedBranchId = (req as any).user?.managedBranchId;
    if (managedBranchId) {
      if (queryBranchId && queryBranchId !== managedBranchId) {
        throw new ForbiddenException('You do not have access to this branch');
      }
      return managedBranchId;
    }
    return queryBranchId;
  }

  @Get('inventory')
  getInventory(@Req() req: Request, @Query('branchId') branchId?: string) {
    return this.managerService.getInventory(this.getBranchId(req, branchId));
  }

  @Get('orders')
  getOrders(@Req() req: Request, @Query('branchId') branchId?: string) {
    return this.managerService.getOrders(this.getBranchId(req, branchId));
  }

  @Get('revenue')
  getRevenue(@Req() req: Request, @Query('branchId') branchId?: string) {
    return this.managerService.getRevenue(this.getBranchId(req, branchId));
  }

  @Post('product/:id')
  updateProduct(@Req() req: Request, @Param('id') id: string, @Body() body: any) {
    const branchId = this.getBranchId(req, body.branchId);
    return this.managerService.updateProduct(+id, { ...body, branchId });
  }
}
