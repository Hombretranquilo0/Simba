import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  /** Public — any client can fetch current rates */
  @Get('rates')
  getRates() {
    return this.currencyService.getRates();
  }

  /** Super admin only — update rates */
  @Patch('rates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  updateRates(@Body() body: { USD?: number; EUR?: number }) {
    return this.currencyService.updateRates(body.USD, body.EUR);
  }
}
