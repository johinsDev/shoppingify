import { Column, HasMany, Model, Table } from 'sequelize-typescript';
import { Item } from './item.model';

@Table({
  paranoid: true,
  tableName: 'categories',
  underscored: true,
})
export class Category extends Model {
  @Column
  name: string;

  @HasMany(() => Item)
  items: Item[];
}
