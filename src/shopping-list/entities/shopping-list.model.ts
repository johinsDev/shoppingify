import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  Model,
  Scopes,
  Table,
} from 'sequelize-typescript';
import { User } from 'src/auth/user.model';
import { ShoppingListItem } from '../../shopping-list-items/entities/shopping-list-item.model';
import { Item } from './item.model';

@Table({
  tableName: 'shopping_lists',
  paranoid: true,
  underscored: true,
  omitNull: true,
})
@Scopes(() => ({
  actives: {
    where: {
      cancelledAt: null,
      completedAt: null,
    },
  },
}))
export class ShoppingList extends Model {
  @Column
  name: string;

  @Column(DataType.DATE)
  completedAt: Date;

  @Column(DataType.DATE)
  cancelledAt: Date;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsToMany(() => Item, () => ShoppingListItem)
  items: Item[];
}
