import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from 'src/auth/auth.module';
import { Category } from 'src/categories/entities/category.model';
import { Item } from 'src/items/entities/item.model';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  controllers: [StatsController],
  providers: [StatsService],
  imports: [SequelizeModule.forFeature([Category, Item]), AuthModule],
})
export class StatsModule {}
