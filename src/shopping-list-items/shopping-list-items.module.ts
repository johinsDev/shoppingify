import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from 'src/auth/auth.module';
import { Item } from 'src/shopping-list/entities/item.model';
import { ShoppingList } from 'src/shopping-list/entities/shopping-list.model';
import { ShoppingListItem } from './entities/shopping-list-item.model';
import { ShoppingListItemsController } from './shopping-list-items.controller';
import { ShoppingListItemsService } from './shopping-list-items.service';

@Module({
  controllers: [ShoppingListItemsController],
  providers: [ShoppingListItemsService],
  imports: [
    SequelizeModule.forFeature([Item, ShoppingListItem, ShoppingList]),
    AuthModule,
  ],
})
export class ShoppingListItemsModule {}
