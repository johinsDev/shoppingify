import { Column, HasMany, Model, Table } from 'sequelize-typescript';
import { Item } from 'src/shopping-list/entities/item.model';
import { ShoppingList } from 'src/shopping-list/entities/shopping-list.model';
import { Token } from './token.model';

@Table({
  tableName: 'users',
  paranoid: true,
  underscored: true,
})
export class User extends Model {
  @Column({
    unique: true,
  })
  email: string;

  @Column({
    allowNull: true,
  })
  password: string;

  @HasMany(() => Token)
  tokens: Token[];

  @HasMany(() => ShoppingList)
  shoppingList: ShoppingList[];

  @HasMany(() => Item)
  items: Item[];
}
