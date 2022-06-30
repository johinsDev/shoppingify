import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from 'src/auth/auth.module';
import { Category } from 'src/categories/entities/category.model';
import { Item } from 'src/items/entities/item.model';
import { ShoppingListItem } from 'src/shopping-list-items/entities/shopping-list-item.model';
import { CategoryRepository } from './category.repository';
import { ItemRepository } from './item.repository';
import { ShoppingListItemRepository } from './shopping-list-item.repository';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  controllers: [StatsController],
  providers: [
    StatsService,
    ShoppingListItemRepository,
    CategoryRepository,
    ItemRepository,
  ],
  imports: [
    SequelizeModule.forFeature([Category, Item, ShoppingListItem]),
    AuthModule,
  ],
})
export class StatsModule {}
