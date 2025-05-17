import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@/modules/user/user.service';
import { HashService } from '@/core/crypto/hash.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly hashService: HashService, // ✅ inject HashService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException();

    // ✅ Verify hashed password
    const isMatch = await this.hashService.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException();

    const { password: _, ...safeUser } = user;
    return safeUser;
  }

  login(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      // ✅ Generates JWT using configuration from JwtModule (secret, expiresIn: '1d')
      access_token: this.jwtService.sign(payload),
    };
  }
}
