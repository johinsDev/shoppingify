import { Exclude, Expose, Type } from 'class-transformer';
import { Model } from 'sequelize-typescript';
import { ItemDto } from '../../items/dto/item.dto';

export class ItemDtoCollection extends Array<ItemDto> {}

@Exclude()
export class ShoppingListDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  completedAt: Date;

  @Expose()
  cancelledAt: Date;

  @Expose()
  @Type(() => ItemDto)
  items: ItemDtoCollection;

  constructor(partial: Partial<Model | ShoppingListDto>) {
    Object.assign(this, partial instanceof Model ? partial.toJSON() : partial);
  }
}
