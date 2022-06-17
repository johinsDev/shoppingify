import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Token } from './token.model';

@Injectable()
export class TokenRepository {
  constructor(
    @InjectModel(Token)
    public model: typeof Token,
  ) {}
}
