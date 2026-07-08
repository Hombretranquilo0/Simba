import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Request,
  UseGuards,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import * as bcrypt from 'bcrypt';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getProfile(@Request() req) {
    const user = await this.usersService.findById(req.user.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { password, ...profile } = user;
    return profile;
  }

  @Patch('me')
  async updateProfile(
    @Request() req,
    @Body() body: { name?: string; email?: string; password?: string; managedBranchId?: string },
  ) {
    const userId: number = req.user.userId;

    if (body.email) {
      const existing = await this.usersService.findOne(body.email);
      if (existing && existing.id !== userId) {
        throw new ConflictException('Email already in use');
      }
    }

    const updateData: { name?: string; email?: string; password?: string; managedBranchId?: string } = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.password !== undefined) {
      updateData.password = await bcrypt.hash(body.password, 10);
    }
    if (body.managedBranchId !== undefined) updateData.managedBranchId = body.managedBranchId;

    const updated = await this.usersService.update(userId, updateData);
    const { password, ...result } = updated;
    return result;
  }

  @Delete('me')
  async deleteAccount(@Request() req) {
    await this.usersService.delete(req.user.userId);
    return { success: true };
  }
}
