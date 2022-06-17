import { Column, HasMany, Model, Table } from 'sequelize-typescript';
import { Token } from './token.model';

@Table({
  tableName: 'users',
})
export class User extends Model {
  @Column
  email: string;

  @Column
  password: string;

  @HasMany(() => Token)
  tokens: Token[];
}
