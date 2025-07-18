import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { Document, DocumentSchema } from '../model/document.schema';
import { AuthModule } from 'src/auth/auth.module';
import { CollabGateway } from './collab.gateway';

@Module({
  imports: [MongooseModule.forFeature([{ name: Document.name, schema: DocumentSchema }]),AuthModule],
  controllers: [DocumentController],
  providers: [DocumentService, CollabGateway],
})
export class DocumentModule {}
