import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login') // /auth/login
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    const token = this.authService.login(user);

    return {
      access_token: token.access_token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}
