import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { MeDto } from './dto/me.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SingUpDto } from './dto/sign-up.dto';
import { UserRepository } from './user.repository';

@Controller({
  path: 'auth',
})
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userRepository: UserRepository,
  ) {}

  @Post('sign-up')
  async signUp(@Body() body: SingUpDto) {
    await this.userRepository.create(body);

    await this.authService.attempt(body.email, body.password);

    return this.authService.token;
  }

  @Post('sign-in')
  async signIn(@Body() body: SignInDto) {
    await this.authService.attempt(body.email, body.password);

    return this.authService.token;
  }

  @UseGuards(AuthGuard)
  @Get('/me')
  async me() {
    const user = await this.userRepository.findByPk(this.authService.user.id);
    return new MeDto(user);
  }
}
