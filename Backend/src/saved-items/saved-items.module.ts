import { Module } from '@nestjs/common';
import { SavedItemsService } from './saved-items.service';
import { SavedItemsController } from './saved-items.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SavedItemsController],
  providers: [SavedItemsService],
})
export class SavedItemsModule {}
