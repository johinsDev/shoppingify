import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @Transform(({ value }) => (isNaN(Number(value)) ? 1 : parseInt(value, 10)), {
    toClassOnly: true,
  })
  page: number;

  @IsOptional()
  @Transform(({ value }) => (isNaN(Number(value)) ? 10 : parseInt(value, 10)), {
    toClassOnly: true,
  })
  perPage: number;
}
