import {
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Item } from '../../items/entities/item.model';
import { ShoppingList } from '../../shopping-list/entities/shopping-list.model';

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
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

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
