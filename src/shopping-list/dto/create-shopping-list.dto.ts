import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateShoppingListDto {
  @IsString()
  @MinLength(5)
  @MaxLength(255)
  name: string;
}
