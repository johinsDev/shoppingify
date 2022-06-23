import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { ValidationError } from 'sequelize/types';
import { SignInDto } from './dto/sign-in.dto';
import { User } from './user.model';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User)
    public userModel: typeof User,
  ) {}

  model() {
    return this.userModel;
  }

  async create(body: SignInDto) {
    try {
      return await this.model().create({
        email: body.email,
        password: await bcrypt.hash(body.password, 10),
      });
    } catch (error) {
      const e = error as ValidationError;

      const errors = e.errors.reduce((acc, e) => {
        acc[e.path] = e.message;

        return acc;
      }, {} as any);

      throw new BadRequestException(errors);
    }
  }

  async findByPk(identifier: string | number) {
    return this.model().findByPk(identifier);
  }
}
