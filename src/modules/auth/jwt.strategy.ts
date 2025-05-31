import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  /* --------------------------------------------------------------------
   * validate
   *
   * This method is automatically called by Passport after a JWT is verified.
   * It receives the decoded payload and returns the user object
   * that will be attached to the request as `req.user`.
   *
   * This is where you can shape the user data available across your app.
   * In this case, we return the user's id, email, and role from the token.
   * -------------------------------------------------------------------- */
  validate(payload: any) {
    // console.log('JwtStrategy > validate');
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
