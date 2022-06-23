import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from 'src/auth/auth.module';
import { Category } from './entities/category.model';
import { Item } from './entities/item.model';
import { ShoppingListItem } from './entities/shopping-list-item.model';
import { ShoppingList } from './entities/shopping-list.model';
import { ShoppingListController } from './shopping-list.controller';
import { ShoppingListService } from './shopping-list.service';

@Module({
  controllers: [ShoppingListController],
  providers: [ShoppingListService],
  imports: [
    AuthModule,
    SequelizeModule.forFeature([
      Item,
      Category,
      ShoppingList,
      ShoppingListItem,
    ]),
  ],
})
export class ShoppingListModule {}
