// src/documents/documents.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Document, DocumentDocument } from './documents.schema';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { CreateDocumentDto } from './create-document.dto';
import { Logo, LogoDocument } from './logo.schema';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(Document.name) private docModel: Model<DocumentDocument>,
    @InjectModel(Logo.name) private logoModel: Model<LogoDocument>,
  ) {}

  async upload(createDto: any): Promise<Document> {
    try {
      const document = await this.docModel.create({
        ...createDto,
        createdAt: new Date(),
      });
      return document;
    } catch (error) {
      throw new Error(`Failed to save document: ${error.message}`);
    }
  }

  async findByPatient(patientId: string): Promise<Document[]> {
    return this.docModel.find({ patientId }).sort({ createdAt: -1 }).exec();
  }

  async delete(id: string): Promise<void> {
    const document = await this.docModel.findById(id);
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Delete the physical file
    try {
      const filePath = join(process.cwd(), document.url);
      await unlink(filePath);
    } catch (error) {
      console.warn(`Failed to delete file: ${error.message}`);
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    await this.docModel.findByIdAndDelete(id);
  }

  async findById(id: string): Promise<Document> {
    const document = await this.docModel.findById(id);
    if (!document) {
      throw new NotFoundException('Document not found');
    }
    return document;
  }

  async findAll(): Promise<Document[]> {
    return this.docModel.find().sort({ createdAt: -1 }).exec();
  }


  async uploadDoctorLogo(logoData: { logo: string; logoName: string; description?: string }) {
    // Save to database using the Logo schema
    const logo = new this.logoModel(logoData);
    return logo.save();
  }


  //  get last logo 
  async getLastDoctorLogo(): Promise<Logo> {
    const logo = await this.logoModel.findOne().sort({ createdAt: -1 }).exec();
    if (!logo) {
      throw new NotFoundException('No doctor logo found');
    }
    return logo;
  }
}