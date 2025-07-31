  // src/common/config/multer.config.ts
  import { diskStorage } from 'multer';
  import { extname } from 'path';
  import { HttpException, HttpStatus } from '@nestjs/common';

  const imageFileFilter = (req, file, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return callback(
        new HttpException('Only image files are allowed!', HttpStatus.BAD_REQUEST),
        false
      );
    }
    callback(null, true);
  };

  export const restaurantMulterConfig = {
    storage: diskStorage({
      destination: './uploads/documents',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        callback(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: imageFileFilter,
    limits: {
      fileSize: 1024 * 1024 * 5 // 5MB
    }
  };

  export const menuItemMulterConfig = {
    storage: diskStorage({
      destination: './uploads/documents', // Ensure this is correct
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        callback(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: imageFileFilter,
    limits: {
      fileSize: 1024 * 1024 * 5 // 5MB
    }
  };








// // src/common/config/multer.config.ts
// import { diskStorage } from 'multer';
// import { extname } from 'path';
// import { HttpException, HttpStatus } from '@nestjs/common';

// export const multerConfig = {
//     storage: diskStorage({
//         destination: './uploads/menu-items',
//         filename: (req, file, callback) => {
//             const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//             callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
//         }
//     }),
//     fileFilter: (req, file, callback) => {
//         if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
//             return callback(
//                 new HttpException(
//                     'Only image files are allowed!',
//                     HttpStatus.BAD_REQUEST
//                 ),
//                 false
//             );
//         }
//         callback(null, true);
//     },
//     limits: {
//         fileSize: 1024 * 1024 * 5 // 5MB
//     }
// };
