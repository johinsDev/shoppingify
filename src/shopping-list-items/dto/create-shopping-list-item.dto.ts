import { IsInt, Max, Min } from 'class-validator';

export class CreateShoppingListItemDto {
  @Max(100)
  @Min(0)
  @IsInt()
  quantity?: number;
}
