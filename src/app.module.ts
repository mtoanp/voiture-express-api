import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    // eslint-disable-next-line
    ConfigModule.forRoot({
      isGlobal: true, // makes it available app-wide
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
