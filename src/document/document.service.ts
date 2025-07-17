import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Document } from '../model/document.schema';

@Injectable()
export class DocumentService {
  constructor(@InjectModel(Document.name) private documentModel: Model<Document>) {}

  async createDocument(title: string, content = '', users: string[] = []): Promise<Document> {
    const doc = new this.documentModel({ title, content, users });
    return doc.save();
  }

  async getAllDocuments(): Promise<Document[]> {
    return this.documentModel.find().exec();
  }

  async getDocumentById(id: string): Promise<Document> {
    const doc = await this.documentModel.findById(id).exec();
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async updateDocument(id: string, update: Partial<Document>): Promise<Document> {
    const doc = await this.documentModel.findByIdAndUpdate(id, update, { new: true }).exec();
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async deleteDocument(id: string): Promise<void> {
    const result = await this.documentModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Document not found');
  }
}
