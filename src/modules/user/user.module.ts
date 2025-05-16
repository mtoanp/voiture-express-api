import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { DatabaseModule } from '@/core/database/database.module';

@Module({
  imports: [DatabaseModule], // 👈 required!
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
