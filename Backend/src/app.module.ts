import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ManagerModule } from './manager/manager.module';
import { OrdersModule } from './orders/orders.module';
import { AIModule } from './ai/ai.module';
import { SavedItemsModule } from './saved-items/saved-items.module';
import { SuperAdminModule } from './super-admin/super-admin.module';
import { CurrencyModule } from './currency/currency.module';

@Module({
  imports: [
    PrismaModule,
    ProductsModule,
    AuthModule,
    UsersModule,
    ManagerModule,
    OrdersModule,
    AIModule,
    SavedItemsModule,
    SuperAdminModule,
    CurrencyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
