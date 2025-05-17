import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UserModule } from '@/modules/user/user.module';
import { HashService } from '@/core/crypto/hash.service';

@Module({
  imports: [
    ConfigModule, // ✅ Access to environment variables (e.g., JWT_SECRET)
    UserModule, // ✅ Provides UserService (for validating users in AuthService)
    PassportModule, // ✅ Enables Passport strategies (like JWT)
    JwtModule.registerAsync({
      // ✅ Configures JwtService with dynamic values
      imports: [ConfigModule], // ⤷ Needed to inject ConfigService
      inject: [ConfigService], // ⤷ Provides config to the factory
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'), // ⤷ Loads JWT secret from .env
        signOptions: { expiresIn: '1d' }, // ⤷ Sets default token expiration
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, HashService],
  exports: [AuthService],
})
export class AuthModule {}
