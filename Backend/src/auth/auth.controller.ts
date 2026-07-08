import { Controller, Post, Body, UnauthorizedException, HttpCode, HttpStatus, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { GoogleAuthGuard } from './google-auth.guard';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: any) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('signup')
  async signUp(@Body() body: any) {
    return this.authService.signUp(body.email, body.password, body.name, body.role, body.managedBranchId);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Req() req) {}

  @Get('callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    try {
      console.log('[Google CB] req.user =', JSON.stringify(req.user));
      const user = await this.authService.validateGoogleUser(req.user);
      console.log('[Google CB] validated user =', user?.id, user?.email);
      const { access_token, user: userData } = await this.authService.login(user);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectUrl = `${frontendUrl}/auth/callback?token=${access_token}&user=${encodeURIComponent(JSON.stringify(userData))}`;
      return res.redirect(redirectUrl);
    } catch (err) {
      console.error('[Google CB ERROR]', err?.message, err?.stack);
      return res.status(500).json({ error: err?.message, stack: err?.stack });
    }
  }
}
