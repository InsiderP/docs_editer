import { Controller, Post, Get, Patch, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth, ApiBody, ApiProperty } from '@nestjs/swagger';
import { DocumentService } from './document.service';
import { AuthGuard } from '../auth/auth.guard';
import { Request } from 'express';
import { Types } from 'mongoose';


class CreateDocumentDto {
  @ApiProperty({ description: 'Title of the document' })
  title: string;

  @ApiProperty({ description: 'Content of the document', required: false })
  content?: string;
}

class UpdateDocumentDto {
  title?: string;
  content?: string;
}

@ApiTags('documents')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Document created.' })
  @ApiBody({ type: CreateDocumentDto })
  create(@Body() body: CreateDocumentDto, @Req() req: Request) {
    const user = (req as any).user;
    // Only the authenticated user is added as a collaborator/owner
    return this.documentService.createDocument(body.title, body.content, [user.sub]);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'Get all documents.' })
  findAll() {
    return this.documentService.getAllDocuments();
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Get document by id.' })
  findOne(@Param('id') id: string) {
    return this.documentService.getDocumentById(id);
  }

  @Patch(':id')
  @ApiResponse({ status: 200, description: 'Update document.' })
  @ApiBody({ type: UpdateDocumentDto })
  update(@Param('id') id: string, @Body() update: UpdateDocumentDto, @Req() req: Request) {
    // Only allow title/content update, not users
    const { title, content } = update;
    return this.documentService.updateDocument(id, { title, content });
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Delete document.' })
  remove(@Param('id') id: string) {
    return this.documentService.deleteDocument(id);
  }
}
