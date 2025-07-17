import { Module } from '@nestjs/common';
import { MongoDbModule } from './common/mongodb.config';
import { AuthModule } from './auth/auth.module';
import { DocumentModule } from './document/document.module';

@Module({
  imports: [...MongoDbModule,AuthModule, DocumentModule],
})
export class AppModule {}
