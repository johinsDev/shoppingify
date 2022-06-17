import { Controller, Get } from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';

@Controller({
  path: 'auth',
})
export class AuthController {
  // inject auth service
  constructor(
    private readonly authService: AuthService,
    private readonly authRepository: AuthRepository,
  ) {}

  @Get()
  async list() {
    // await this.authRepository.userModel.create({
    //   email: 'johinsdev@gmai.com',
    //   password: await bcrypt.hash('123456', 10),
    // });
    return this.authService.attempt('johinsdev@gmail.com', '123456');
  }
}
