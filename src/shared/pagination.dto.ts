import { Exclude, Expose, Transform } from 'class-transformer';
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

@Exclude()
export class MetaDto {
  @Expose()
  total: number;

  @Expose()
  perPage: number;

  @Expose()
  page: number;

  @Expose()
  totalPages: number;

  @Expose()
  nextPage: number;

  @Expose()
  prevPage: number;

  @Expose()
  firstPage: number;

  @Expose()
  lastPage: number;

  constructor(partial: Partial<MetaDto>) {
    Object.assign(this, partial);
  }
}

@Exclude()
export class PaginationMetaDto<T> {
  @Expose()
  meta: MetaDto;

  @Expose()
  data: T;

  constructor(partial: Partial<PaginationMetaDto<T>>) {
    Object.assign(this, partial);
  }
}
