import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateShoppingListDto } from './create-shopping-list.dto';
import { ShoppingListFilterStatus } from './shopping-list-filters.dto';

export class UpdateShoppingListDto extends PartialType(CreateShoppingListDto) {
  @IsOptional()
  @IsEnum(ShoppingListFilterStatus)
  status?: ShoppingListFilterStatus;
}
