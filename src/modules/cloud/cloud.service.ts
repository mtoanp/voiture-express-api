import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { s3Client } from './s3.config';

@Injectable()
export class CloudService {
  private readonly bucket = process.env.AWS_BUCKET_NAME!;
  private readonly region = process.env.AWS_REGION!;

  /* --------------------------------------------------------------------
   * Upload a file to S3 with public access (returns direct URL).
   * Use this only for public files like avatars, logos, etc.
   * -------------------------------------------------------------------- */
  async upload(
    file: Express.Multer.File,
    fileKey: string,
    folder: string,
  ): Promise<string> {
    const key = `${folder}/${fileKey}`; // 'documents/abc123.pdf'

    // Optional: Add file validation
    // if (file.size > 5_000_000) {
    //   throw new BadRequestException('File too large (max 5MB)');
    // }
    // if (!['image/jpeg', 'application/pdf'].includes(file.mimetype)) {
    //   throw new BadRequestException('Invalid file type');
    // }

    try {
      await s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype, // e.g. 'application/pdf'
          ContentDisposition: 'inline', // 👈 required to show in browser
        }),
      );

      // Return key: 'documents/abc123.pdf' > save to db
      return key;
    } catch (error) {
      console.error('S3 upload (public) failed:', error);
      throw new InternalServerErrorException(
        'Failed to upload public file to S3',
      );
    }
  }

  /* --------------------------------------------------------------------
   * Helper to build public S3 URL from key.
   * -------------------------------------------------------------------- */
  getPublicUrl(key: string): string {
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  /* --------------------------------------------------------------------
   * Generate a temporary signed URL to access a private file.
   * This URL is valid only for a short time (default: 1 hour).
   * -------------------------------------------------------------------- */
  async getSignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ResponseContentDisposition: 'inline', // opens in browser
    });

    try {
      return await getSignedUrl(s3Client, command, {
        expiresIn: expiresInSeconds,
      });
    } catch (error) {
      console.error('Signed URL generation failed:', error);
      throw new InternalServerErrorException('Failed to create signed URL');
    }
  }

  /* --------------------------------------------------------------------
   * Generate a signed upload URL for frontend to PUT file directly to S3.
   * Use this when you want frontend to upload without passing through backend.
   * -------------------------------------------------------------------- */
  async generateSignedUploadUrl(
    fileKey: string,
    folder: string,
    contentType: string,
    expiresInSeconds = 300,
  ): Promise<string> {
    const key = `${folder}/${fileKey}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    try {
      return await getSignedUrl(s3Client, command, {
        expiresIn: expiresInSeconds,
      });
    } catch (error) {
      console.error('Signed upload URL generation failed:', error);
      throw new InternalServerErrorException(
        'Failed to create signed upload URL',
      );
    }
  }

  /* --------------------------------------------------------------------
   * Delete a file from S3.
   * -------------------------------------------------------------------- */
  async delete(key: string): Promise<void> {
    try {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
    } catch (error) {
      console.error('S3 delete failed:', error);
      throw new InternalServerErrorException('Failed to delete file from S3');
    }
  }
}
