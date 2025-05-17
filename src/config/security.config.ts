import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export function setupSecurity(
  app: INestApplication,
  configService: ConfigService,
) {
  // ✅ Helmet – secure headers
  app.use(helmet());

  // 🌐 CORS – origin from .env
  const corsOptions = getCorsOptions(configService);
  app.enableCors(corsOptions);

  // ✅ Add global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown fields
      forbidNonWhitelisted: true, // Throw error on unknown fields
      transform: true, // Auto-transform payloads into DTOs
    }),
  );

  // And more (e.g., cookieParser, csurf)
}

function getCorsOptions(configService: ConfigService): CorsOptions {
  const origins = configService
    .get<string>('CORS_ORIGIN')
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return {
    origin: process.env.NODE_ENV === 'development' ? true : (origins ?? []),
    credentials: true,
  };
}
