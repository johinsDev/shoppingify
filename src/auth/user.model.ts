import { Column, HasMany, Model, Table } from 'sequelize-typescript';
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
}
