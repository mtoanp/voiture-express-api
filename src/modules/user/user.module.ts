import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { DatabaseModule } from '@/core/database/database.module';
import { HashService } from '@/core/crypto/hash.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule)], // 👈 required!
  controllers: [UserController],
  providers: [UserService, HashService],
  exports: [UserService], // accessible from other modules that import this module (e.g. AuthModule)
})
export class UserModule {}
