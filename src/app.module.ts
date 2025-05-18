import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { DatabaseModule } from './core/database/database.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { CloudModule } from './modules/cloud/cloud.module';

@Module({
  imports: [
    // ✅ Loads .env variables into process.env and makes config available globally
    ConfigModule.forRoot({
      isGlobal: true, // makes it available app-wide
      // envFilePath: 'src/config/.env',
    }),

    // ✅ Set up named rate limit profiles (short, medium, long)
    ThrottlerModule.forRoot({
      throttlers: [
        // {
        //   name: 'short',
        //   ttl: 1000,
        //   limit: 3,
        // },
        // {
        //   name: 'medium',
        //   ttl: 10000,
        //   limit: 2,
        // },
        {
          name: 'long',
          ttl: 60000,
          limit: 100, //2
        },
      ],
    }),

    // ✅ Domain feature modules
    UserModule,

    // ✅ Shared app-wide database access
    DatabaseModule,

    AuthModule,

    CloudModule,
  ],

  controllers: [AppController],

  providers: [
    AppService,

    // ✅ Applies ThrottlerGuard globally (uses default or per-route config)
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
