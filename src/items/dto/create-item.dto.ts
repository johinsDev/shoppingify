import {
  IsDefined,
  IsInt,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateItemDto {
  @IsString()
  @MaxLength(255)
  @MinLength(1)
  name: string;

  @IsString()
  @MaxLength(2000)
  note: string;

  @IsString()
  @MaxLength(255)
  @MinLength(1)
  image: string;

  @IsInt()
  @IsDefined()
  categoryId: number;
}
