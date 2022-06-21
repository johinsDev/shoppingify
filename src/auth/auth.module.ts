import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Token } from './token.model';
import { TokenRepository } from './token.repository';
import { User } from './user.model';
import { UserRepository } from './user.repository';

@Module({
  providers: [AuthService, UserRepository, AuthService, TokenRepository],
  imports: [SequelizeModule.forFeature([User, Token])],
  controllers: [AuthController],
  exports: [AuthService, UserRepository],
})
export class AuthModule {}
