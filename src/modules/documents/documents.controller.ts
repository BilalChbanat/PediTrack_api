// src/documents/documents.controller.ts
import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UploadedFile,
  UseInterceptors,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';
import { existsSync, mkdirSync } from 'fs';
import { CreateDocumentDto } from './create-document.dto';

// Image file filter
const imageFileFilter = (req: any, file: Express.Multer.File, callback: any) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    return callback(
      new HttpException('Only image files are allowed!', HttpStatus.BAD_REQUEST),
      false
    );
  }
  callback(null, true);
};

// Multer configuration for documents
const documentsMulterConfig = {
  storage: diskStorage({
    destination: (req: any, file: Express.Multer.File, cb: any) => {
      const uploadPath = './uploads/documents';
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req: any, file: Express.Multer.File, cb: any) => {
      const uniqueFilename = `${uuid()}${extname(file.originalname)}`;
      cb(null, uniqueFilename);
    },
  }),
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB limit
  },
};

// Multer configuration for doctor logos
const logoMulterConfig = {
  storage: diskStorage({
    destination: (req: any, file: Express.Multer.File, cb: any) => {
      const uploadPath = './uploads/logo';
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req: any, file: Express.Multer.File, cb: any) => {
      const uniqueFilename = `${uuid()}${extname(file.originalname)}`;
      cb(null, uniqueFilename);
    },
  }),
  fileFilter: (req: any, file: Express.Multer.File, callback: any) => {
    console.log('File filter - processing file:', file.originalname, file.mimetype);
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      console.log('File rejected - invalid extension');
      return callback(
        new HttpException('Only image files are allowed!', HttpStatus.BAD_REQUEST),
        false
      );
    }
    console.log('File accepted');
    callback(null, true);
  },
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB limit for logos (increased from 2MB)
  },
};

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', documentsMulterConfig))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateDocumentDto,
  ) {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    console.log('File uploaded:', {
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });

    const documentData: CreateDocumentDto = {
      patientId: body.patientId,
      title: body.title,
      url: `uploads/documents/${file.filename}`,
      type: file.mimetype,
    };

    return this.documentsService.upload(documentData);
  }


  // view documents by id
  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.documentsService.findById(id);
  }

  @Get('patient/:patientId')
  async getByPatient(@Param('patientId') patientId: string) {
    return this.documentsService.findByPatient(patientId);
  }



  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.documentsService.delete(id);
  }

  @Get('file/:filename')
  async getFile(@Param('filename') filename: string) {
    return { url: `uploads/documents/${filename}` };
  }

  @Post('doctors/logo')
  @UseInterceptors(FileInterceptor('logo', logoMulterConfig))
  async uploadDoctorLogo(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any
  ) {
    console.log('Request received');
    console.log('File received:', file);
    console.log('Body received:', body);
    console.log('Request headers:', JSON.stringify(body, null, 2));

    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    console.log('Doctor logo uploaded:', {
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });

    const logoData = {
      logo: `uploads/logo/${file.filename}`, // File path
      logoName: body.logoName || file.originalname, // Use provided name or original filename
      description: body.description || '', // Optional description
    };

    return this.documentsService.uploadDoctorLogo(logoData);
  }


  //  get last logo
  @Get('doctor/logo')
  async getLastDoctorLogo() {
    return this.documentsService.getLastDoctorLogo();
  }
}




// // src/documents/documents.controller.ts
// import {
//   Controller,
//   Post,
//   Get,
//   Delete,
//   Param,
//   UploadedFile,
//   UseInterceptors,
//   Body,
//   Query,
//   HttpException,
//   HttpStatus,
// } from '@nestjs/common';
// import { FileInterceptor } from '@nestjs/platform-express';
// import { DocumentsService } from './documents.service';
// import { diskStorage } from 'multer';
// import { extname, join } from 'path';
// import { v4 as uuid } from 'uuid';
// import { existsSync, mkdirSync } from 'fs';
// import { CreateDocumentDto } from './create-document.dto';
// import { range } from 'rxjs';
// import { UserService } from '../auth/services/userService.service';

// // Image file filter
// const imageFileFilter = (req: any, file: Express.Multer.File, callback: any) => {
//   if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
//     return callback(
//       new HttpException('Only image files are allowed!', HttpStatus.BAD_REQUEST),
//       false
//     );
//   }
//   callback(null, true);
// };

// // Multer configuration for documents
// const multerConfig = {
//   storage: diskStorage({
//     destination: (req: any, file: Express.Multer.File, cb: any) => {
//       const uploadPath = './uploads/documents';
//       // Ensure directory exists
//       if (!existsSync(uploadPath)) {
//         mkdirSync(uploadPath, { recursive: true });
//       }
//       cb(null, uploadPath);
//     },
//     filename: (req: any, file: Express.Multer.File, cb: any) => {
//       // Generate unique filename with UUID
//       const uniqueFilename = `${uuid()}${extname(file.originalname)}`;
//       cb(null, uniqueFilename);
//     },
//   }),
//   fileFilter: imageFileFilter,
//   limits: {
//     fileSize: 1024 * 1024 * 5, // 5MB limit
//   },
// };

// @Controller('documents')
// export class DocumentsController {
//   constructor(private readonly documentsService: DocumentsService,
//   ) {}

//   @Post('upload')
//   @UseInterceptors(FileInterceptor('file', multerConfig))
//   async uploadFile(
//     @UploadedFile() file: Express.Multer.File,
//     @Body() body: CreateDocumentDto,
//   ) {
//     if (!file) {
//       throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
//     }

//     console.log('File uploaded:', {
//       filename: file.filename,
//       originalname: file.originalname,
//       mimetype: file.mimetype,
//       size: file.size,
//     });

//     // Frontend sends: patientId, title
//     // Backend generates: url, type (and other metadata)
//     const documentData: CreateDocumentDto = {
//       patientId: body.patientId,
//       title: body.title,
//       url: `uploads/documents/${file.filename}`, // Backend generates this
//       type: file.mimetype, // Backend generates this (e.g., 'image/jpeg', 'image/png')
//     };

//     return this.documentsService.upload(documentData);
//   }

//   @Get('patient/:patientId')
//   async getByPatient(@Param('patientId') patientId: string) {
//     return this.documentsService.findByPatient(patientId);
//   }

//   @Delete(':id')
//   async delete(@Param('id') id: string) {
//     return this.documentsService.delete(id);
//   }

//   // Optional: Add endpoint to serve uploaded files
//   @Get('file/:filename')
//   async getFile(@Param('filename') filename: string) {
//     // You might want to add file serving logic here
//     // or use NestJS static file serving
//     return { url: `uploads/documents/${filename}` };
//   }


//   // store doctor logo in the distination  uploads/logo
  

//    @Post('doctors/logo')
//   @UseInterceptors(FileInterceptor('logo'))
//   async uploadDoctorLogo(@UploadedFile() file: Express.Multer.File) {

//     if (!file) {
//       throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
//     }
//     console.log('Doctor logo uploaded:', {
//       logoName: file.filename,
//       logo: file.originalname,
   
//     });
//     return this.documentsService.uploadDoctorLogo(file);
//   }
// }

