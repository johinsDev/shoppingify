import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { ItemDto } from 'src/items/dto/item.dto';

@Exclude()
export class CategoryDto {
  @Expose()
  name: string;

  @Expose()
  id: number;

  @Expose()
  @Transform(({ obj: c }) => c.items?.length > 15)
  hasMore: boolean;

  @Expose()
  @Type(() => ItemDto)
  items: ItemDto[];

  constructor(partial: Partial<CategoryDto>) {
    Object.assign(this, partial);
  }
}
