import { Exclude, Expose, Transform } from 'class-transformer';
import { Model } from 'sequelize-typescript';
import { Item } from '../entities/item.model';

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
  @Transform(({ value, obj }) => {
    return value ?? (obj as Item).shoppingListItem?.[0]?.quantity ?? 0;
  })
  quantity: number;

  @Expose()
  @Transform(({ value, obj }) => {
    return (
      value ?? (obj as Item).shoppingListItem?.some((s) => s.done) ?? false
    );
  })
  done: boolean;

  @Expose()
  @Transform(({ value, obj }) => {
    return value ?? !!(obj as Item).shoppingListItem?.length;
  })
  inCart: boolean;

  constructor(partial: Partial<Model | ItemDto>) {
    Object.assign(this, partial instanceof Model ? partial.toJSON() : partial);
  }
}
