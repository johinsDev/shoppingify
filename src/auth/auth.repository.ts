import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.model';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectModel(User)
    public userModel: typeof User,
  ) {}
}
