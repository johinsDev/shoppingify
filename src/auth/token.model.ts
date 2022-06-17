import {
  BelongsTo,
  Column,
  ForeignKey,
  Length,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from './user.model';

@Table({
  tableName: 'tokens',
  underscored: true,
})
export class Token extends Model {
  @Column({
    allowNull: false,
  })
  name: string;

  @Column({
    allowNull: false,
  })
  type: string;

  @Length({ max: 64 })
  @Column({
    allowNull: false,
    unique: true,
  })
  token: string;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => User)
  userId: number;
}
