import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from '../../shared/pagination.dto';

export enum ShoppingListFilterStatus {
  active = 'active',
  cancelled = 'cancelled',
  completed = 'completed',
}

export class ShoppingListFiltersDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ShoppingListFilterStatus)
  status?: ShoppingListFilterStatus;
}
