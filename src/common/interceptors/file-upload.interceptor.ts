import { BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

/**
 * Returns a configured FileInterceptor for single file upload.
 * customize `fieldName`, `maxSize`
 * valide `allowedMimeTypes`
 */
export function createFileUploadInterceptor(options?: {
  fieldName?: string;
  maxSizeInMB?: number;
  allowedMimeTypes?: string[];
}) {
  const {
    fieldName = 'file',
    maxSizeInMB = 5,
    allowedMimeTypes = ['application/pdf', 'image/jpeg'],
  } = options || {};

  return FileInterceptor(fieldName, {
    storage: memoryStorage(), // or diskStorage
    limits: { fileSize: maxSizeInMB * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(
          new BadRequestException('Only PDF or JPEG files are allowed'),
          false,
        );
      }
      cb(null, true);
    },
  });
}
