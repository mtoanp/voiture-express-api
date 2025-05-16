import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Module({
  providers: [DatabaseService], // Provide DatabaseService within this module (Singleton)
  exports: [DatabaseService], // Export DatabaseService for other modules (that import DatabaseModule)
})
export class DatabaseModule {}
