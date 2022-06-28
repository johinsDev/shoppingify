import { Attributes, FindOptions } from 'sequelize';
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
import { User } from 'src/auth/user.model';
import { Category } from '../../categories/entities/category.model';
import { ShoppingListItem } from '../../shopping-list-items/entities/shopping-list-item.model';
import { ShoppingList } from '../../shopping-list/entities/shopping-list.model';

@Table({
  paranoid: true,
  tableName: 'items',
  underscored: true,
})
export class Item extends Model {
  private static query?: FindOptions<Attributes<Item>>;

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

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => User)
  userId: number;

  static where(options: FindOptions<Attributes<Item>>) {
    this.query = options;
    return this;
  }

  static async paginate(
    page?: number,
    perPage?: number,
    options?: FindOptions<Attributes<Item>>,
  ) {
    page = Math.max(page ?? 1, 1);

    perPage = Math.max(perPage ?? 10, 1);

    const countOptions = Object.keys(this.query).reduce((acc, key) => {
      if (!['order', 'attributes', 'include'].includes(key)) {
        acc[key] = this.query[key];
      }
      return acc;
    }, {});

    const total = await this.count({
      ...(this.query && countOptions),
      ...(options ?? {}),
    });

    page = Math.min(total, page);

    const data = await this.findAll({
      ...(this.query && this.query),
      ...(options ?? {}),
      limit: perPage,
      offset: (page - 1) * perPage,
      subQuery: false,
    });

    return {
      data,
      meta: {
        page,
        perPage,
        nextPage: Math.min(page + 1, Math.ceil(total / perPage)),
        prevPage: Math.max(page - 1, 1),
        totalPages: Math.ceil(total / perPage),
        total,
        lastPage: Math.ceil(total / perPage),
        firstPage: 1,
      },
    };
  }
}
