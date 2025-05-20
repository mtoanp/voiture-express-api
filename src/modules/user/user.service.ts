import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DatabaseService } from '@/core/database/database.service';
import { HashService } from '@/core/crypto/hash.service';
import { UserRole } from './dto/update-user.dto';
import { AuthService } from '../auth/auth.service';
import { CloudService } from '../cloud/cloud.service';
import { extname } from 'path';

@Injectable()
export class UserService {
  /* --------------------------------------------------------------------
   * Dependency Injection
   * -------------------------------------------------------------------- */
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly hashService: HashService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly cloudService: CloudService,
  ) {}

  /* --------------------------------------------------------------------
   * findAll
   * Get all users, optionally filtered by role
   * -------------------------------------------------------------------- */
  async findAll(role?: 'user' | 'admin') {
    return this.databaseService.user.findMany({
      where: role ? { role } : undefined,
    });
  }

  /* --------------------------------------------------------------------
   * findOne
   * Get single user by ID, with existence check
   * -------------------------------------------------------------------- */
  async findOne(id: string) {
    const user = await this.verifyUserExists(id);

    if (user.document) {
      user.document = this.cloudService.getPublicUrl(user.document); // public
      // user.document = await this.cloudService.getSignedUrl(user.document); // signed
    }

    return user;
  }

  /* --------------------------------------------------------------------
   * findByEmail
   * Get user by email (used in login/validation flows)
   * Throws NotFoundException if not found
   * -------------------------------------------------------------------- */
  async findByEmail(email: string) {
    const user = await this.databaseService.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new NotFoundException(`User #${email} not found`);
    }
    return user;
  }

  /* --------------------------------------------------------------------
   * create
   * Create new user and return access_token + user info
   * Password is hashed before saving
   * -------------------------------------------------------------------- */
  async create(createUserDto: CreateUserDto) {
    const { password, ...rest } = createUserDto;

    // ✅ Securely hash the password
    const hashedPassword = await this.hashService.hash(password);

    // Create the user
    const user = await this.databaseService.user.create({
      data: {
        ...rest,
        password: hashedPassword,
        role: UserRole.USER, // set default role for user
      },
    });

    // Immediately log them in
    const token = this.authService.login(user);

    // Return user + access_token to controller > that will be forwarded to client
    return {
      access_token: token.access_token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  /* --------------------------------------------------------------------
   * update
   * Update user info and return refreshed access_token
   * -------------------------------------------------------------------- */
  async update(id: string, updateUserDto: UpdateUserDto) {
    // Optional: check existence
    await this.verifyUserExists(id);

    // update user
    const user = await this.databaseService.user.update({
      where: { id },
      data: updateUserDto,
    });

    // login with updated info
    const token = this.authService.login(user);

    // Return user + access_token to controller > that will be forwarded to client
    return {
      access_token: token.access_token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  /* --------------------------------------------------------------------
   * remove
   * Delete user by ID, with existence check
   * -------------------------------------------------------------------- */
  async remove(id: string) {
    await this.verifyUserExists(id);

    return this.databaseService.user.delete({
      where: { id },
    });
  }

  /* --------------------------------------------------------------------
   * verifyUserExists
   * Utility method to check if a user exists by ID
   * Throws NotFoundException if not found
   * -------------------------------------------------------------------- */
  private async verifyUserExists(id: string) {
    const user = await this.databaseService.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
  }

  /* --------------------------------------------------------------------
   * uploadDocument
   * Upload user document (JPEG/PDF) to S3 and store URL in DB
   * Save the s3-file url to data: user
   * -------------------------------------------------------------------- */
  async uploadDocument(id: string, file: Express.Multer.File) {
    // Check user exist
    await this.verifyUserExists(id);

    // Prepare file for cloud upload
    const fileExtension = extname(file.originalname);
    const fileKey = `${id}${fileExtension}`;

    // Upload file to s3 clound
    const upload_key = await this.cloudService.upload(file, fileKey, 'product');

    // Update user document_url
    const updatedUser = await this.databaseService.user.update({
      where: { id },
      data: { document: upload_key },
    });

    console.log('key:', upload_key);

    // Get public url
    const public_url = this.cloudService.getPublicUrl(upload_key);
    console.log('public url:', public_url);

    // Get signed URL for preview/download
    const signedUrl = await this.cloudService.getSignedUrl(
      upload_key,
      20, // 10s
    );
    console.log('signed url:', signedUrl);

    // Return updated user + signed URL
    return {
      ...updatedUser,
      document: public_url,
    };
  }

  /* --------------------------------------------------------------------
   * removeDocument
   * -------------------------------------------------------------------- */
  async removeDocument(userId: string): Promise<{ success: boolean }> {
    const user = await this.verifyUserExists(userId);

    if (!user.document) {
      throw new BadRequestException('No document to remove');
    }

    const documentUrl = user.document;
    const bucketUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;
    const key = documentUrl.replace(bucketUrl, '');

    await this.cloudService.delete(key); // Pass the full S3 key

    await this.databaseService.user.update({
      where: { id: userId },
      data: { document: null },
    });

    return { success: true };
  }
}
