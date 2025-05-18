import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { AllExceptionFilter } from '@/common/filters/all-exeption.filter';
import { setupSecurity } from '@/config/security.config';
import packageJson from '../package.json';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    // 🔧 Load .env configuration service (for accessing CORS, PORT, etc.)
    const configService = app.get(ConfigService);

    // ✅ Global security setup
    setupSecurity(app, configService);

    // ✅ Global Exception Filter: handle & format all thrown errors
    const httpAdapterHost = app.get(HttpAdapterHost);
    app.useGlobalFilters(new AllExceptionFilter(httpAdapterHost));

    // 📦 Global route prefix (e.g., /api/users)
    app.setGlobalPrefix('api');

    // 📦 Versioning route (e.g., /api/v1/users)
    // app.enableVersioning({
    //   type: VersioningType.URI,
    // });

    // 🔧 Get PORT from .env
    const port = configService.get<number>('PORT') ?? 3000;

    await app.listen(port);

    // 📦 Access app version from package.json
    const version = packageJson.version;

    console.log('==================================================');
    console.log(`🚀 Server started on port ${port} (v${version})`);
  } catch (err) {
    console.error('❌ Failed to start NestJS app:', err);
  }
}

void bootstrap();
