import { Exclude, Expose } from 'class-transformer';
import { Model } from 'sequelize';

@Exclude()
export class MeDto {
  @Expose()
  email: string;

  constructor(partial: Partial<Model | MeDto>) {
    Object.assign(this, partial instanceof Model ? partial.toJSON() : partial);
  }
}
