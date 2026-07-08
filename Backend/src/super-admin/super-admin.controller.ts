import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, ParseIntPipe, Query,
} from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('super-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin')
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  // ── Manager Management ────────────────────────────────────────────────────

  @Get('managers')
  listManagers() {
    return this.superAdminService.listManagers();
  }

  @Post('managers')
  createManager(
    @Body() body: { email: string; password: string; name: string; managedBranchId: string },
  ) {
    return this.superAdminService.createManager(
      body.email, body.password, body.name, body.managedBranchId,
    );
  }

  @Patch('managers/:id/reassign')
  reassignManager(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { managedBranchId: string },
  ) {
    return this.superAdminService.reassignManager(id, body.managedBranchId);
  }

  @Delete('managers/:id')
  removeManager(@Param('id', ParseIntPipe) id: number) {
    return this.superAdminService.removeManager(id);
  }

  // ── All-branch Overview ───────────────────────────────────────────────────

  @Get('overview')
  getAllBranchesOverview() {
    return this.superAdminService.getAllBranchesOverview();
  }

  @Get('branch/:branchId/orders')
  getBranchOrders(@Param('branchId') branchId: string) {
    return this.superAdminService.getBranchOrders(branchId);
  }

  @Get('branch/:branchId/inventory')
  getBranchInventory(@Param('branchId') branchId: string) {
    return this.superAdminService.getBranchInventory(branchId);
  }

  @Get('branch/:branchId/revenue')
  getBranchRevenue(@Param('branchId') branchId: string) {
    return this.superAdminService.getBranchRevenue(branchId);
  }
}
