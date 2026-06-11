import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ManagerModule } from './manager/manager.module';

@Module({
  imports: [
    PrismaModule,
    ProductsModule,
    AuthModule,
    UsersModule,
    ManagerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
