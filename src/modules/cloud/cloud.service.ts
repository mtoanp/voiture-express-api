import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from './s3.config';

@Injectable()
export class CloudService {
  async upload(
    file: Express.Multer.File,
    fileKey: string,
    folder: string,
  ): Promise<string> {
    const key = `${folder}/${fileKey}`;
    const bucket = process.env.AWS_BUCKET_NAME!;

    try {
      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype, // e.g. 'application/pdf'
          ContentDisposition: 'inline', // 👈 required to show in browser
        }),
      );

      // Return the public S3 URL
      return `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    } catch (error) {
      console.error('S3 upload failed:', error);
      throw new InternalServerErrorException('Failed to upload document to S3');
    }
  }
}
