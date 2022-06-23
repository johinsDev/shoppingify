import { Exclude, Expose, Transform } from 'class-transformer';
import { Model } from 'sequelize-typescript';

@Exclude()
export class ItemDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  note: string;

  @Expose()
  image: string;

  @Expose()
  @Transform(({ obj }) => obj.ShoppingListItem?.quantity ?? 0)
  quantity: number;

  @Expose()
  @Transform(({ obj }) => Boolean(obj.ShoppingListItem?.done))
  done: boolean;

  constructor(partial: Partial<Model | ItemDto>) {
    Object.assign(this, partial instanceof Model ? partial.toJSON() : partial);
  }
}
