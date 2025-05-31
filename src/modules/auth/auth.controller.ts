import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '@/common/guards';
import { CurrentUser } from '@/common/decorators';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /* --------------------------------------------------------------------
   * Login
   *
   * Handles POST /auth/login
   *
   * This method authenticates a user by validating their credentials
   * (email and password) using the AuthService.
   * If valid, it generates a JWT access token and returns it
   * along with basic user information (id, email, role).
   *
   * This token can then be used for authenticated requests by
   * including it in the Authorization header as a Bearer token.
   * -------------------------------------------------------------------- */
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    // console.log('AuthController > login');
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

  /* --------------------------------------------------------------------
   * getCurrentUser
   *
   * Handles GET /auth/getCurrentUser
   *
   * This endpoint is used to verify the validity of a JWT token,
   * typically after a browser refresh. It uses the JwtAuthGuard
   * to validate the token sent in the Authorization header.
   *
   * If the token is valid, the user's information is extracted
   * from the token and returned. This allows the frontend to
   * restore the user's session without requiring a full login.
   *
   * Commonly called on app load to restore auth state from localStorage.
   *-------------------------------------------------------------------- */
  @UseGuards(JwtAuthGuard)
  @Get('getCurrentUser')
  getCurrentUser(@CurrentUser() currentUser: any) {
    // console.log('AuthController > getCurrentUser', currentUser.id);
    return currentUser;
  }
}
