import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Category } from './category.model';
import { ShoppingListItem } from './shopping-list-item.model';
import { ShoppingList } from './shopping-list.model';

@Table({
  paranoid: true,
  tableName: 'items',
  underscored: true,
})
export class Item extends Model {
  @Column
  name: string;

  @Column({
    allowNull: true,
    type: DataType.TEXT,
  })
  note: string;

  @Column({
    allowNull: true,
  })
  image: string;

  @HasMany(() => ShoppingListItem)
  shoppingListItem: ShoppingListItem[];

  @BelongsToMany(() => ShoppingList, () => ShoppingListItem)
  shoppingList: ShoppingList[];

  @BelongsTo(() => Category)
  category: Category;

  @ForeignKey(() => Category)
  categoryId: number;
}
