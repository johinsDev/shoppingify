import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Item } from './item.model';
import { ShoppingList } from './shopping-list.model';

@Table({
  tableName: 'shopping_lists_items',
  paranoid: true,
  underscored: true,
  indexes: [
    {
      fields: ['shopping_list_id', 'item_id'],
    },
  ],
})
export class ShoppingListItem extends Model {
  @Column(DataType.INTEGER)
  quantity: number;

  @Column(DataType.BOOLEAN)
  done: boolean;

  @BelongsTo(() => ShoppingList)
  shoppingList: ShoppingList;

  @BelongsTo(() => Item)
  item: Item;

  @ForeignKey(() => ShoppingList)
  @Column
  shoppingListId: number;

  @ForeignKey(() => Item)
  @Column
  itemId: number;
}
