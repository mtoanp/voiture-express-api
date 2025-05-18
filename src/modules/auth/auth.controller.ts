import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '@/common/guards';
import { CurrentUser } from '@/common/decorators';

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

  // ✅ Check token validity and return current user info
  @UseGuards(JwtAuthGuard)
  @Get('checkAndRefreshToken') // /auth/checkAndRefreshToken
  checkAndRefreshToken(@CurrentUser() currentUser: any) {
    console.log('AuthController > checkAndRefreshToken', currentUser);
    return currentUser;
  }
}
