import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { Token } from './token.model';
import { TokenRepository } from './token.repository';
import { User } from './user.model';

@Module({
  providers: [AuthService, AuthRepository, AuthService, TokenRepository],
  imports: [SequelizeModule.forFeature([User, Token])],
  controllers: [AuthController],
  exports: [AuthService, AuthRepository],
})
export class AuthModule {}
