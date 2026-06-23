import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (user && user.password && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    };
  }

  async validateGoogleUser(googleUser: any) {
    const { email, googleId, firstName, lastName } = googleUser;
    
    // First, check if user exists with this googleId
    let user = await this.usersService.findByGoogleId(googleId);
    
    if (!user) {
      // Check if user exists with this email but no googleId
      user = await this.usersService.findOne(email);
      
      if (user) {
        // Link googleId to existing user
        user = await this.usersService.update(user.id, { googleId });
      } else {
        // Create new user
        user = await this.usersService.create({
          email,
          googleId,
          name: `${firstName} ${lastName}`,
          role: 'user', // Default role
        });
      }
    }
    
    return user;
  }

  async signUp(email: string, pass: string, name: string) {
    const existingUser = await this.usersService.findOne(email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(pass, 10);
    const user = await this.usersService.create({
      email,
      password: hashedPassword,
      name,
    });

    const { password, ...result } = user;
    return result;
  }
}
