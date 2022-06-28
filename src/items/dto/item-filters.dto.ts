import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/shared/pagination.dto';

export class ItemFiltersDto extends PaginationDto {
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => {
    return parseInt(value, 10);
  })
  categoryId?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    return Boolean(value);
  })
  inCart?: boolean;
}
