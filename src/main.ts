import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionFilter } from '@/common/filters/all-exeption.filter';
import packageJson from '../package.json';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    // ✅ Add global validation pipe
    // app.useGlobalPipes(
    //   new ValidationPipe({
    //     whitelist: true, // Strip unknown fields
    //     forbidNonWhitelisted: true, // Throw error on unknown fields
    //     transform: true, // Auto-transform payloads into DTOs
    //   }),
    // );

    // ✅ Global Exception Filter: handle & format all thrown errors
    const httpAdapterHost = app.get(HttpAdapterHost);
    app.useGlobalFilters(new AllExceptionFilter(httpAdapterHost));

    // 🌐 Enable CORS
    app.enableCors();

    // 📦 Global route prefix (e.g., /api/users)
    app.setGlobalPrefix('api');

    // 📦 Access app version from package.json
    const version = packageJson.version;

    // 🔧 Get PORT from .env
    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT') ?? 3000;

    await app.listen(port);

    console.log(`🚀 Server started on port ${port} (v${version})`);
  } catch (err) {
    console.error('❌ Failed to start NestJS app:', err);
  }
}

void bootstrap();
