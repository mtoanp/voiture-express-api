import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import packageJson from '../package.json';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    // 🌐 Set up CORS
    app.enableCors();

    // Global route prefix
    app.setGlobalPrefix('api');

    // Access app version from package.json
    const version = packageJson.version;

    // Access PORT from .env
    const configService = app.get(ConfigService); // ✅ get service from Nest
    const port = configService.get<number>('PORT') ?? 3000; // process.env.PORT

    await app.listen(port);

    console.log(`🚀 Server started on port ${port} (v${version})`);
  } catch (err) {
    console.error('❌ Failed to start NestJS app:', err);
  }
}

bootstrap();
