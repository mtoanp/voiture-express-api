import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  ParseUUIDPipe,
  UseGuards,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RemovePasswordInterceptor } from './interceptors/remove-password.interceptor';
import { CurrentUser, Roles } from '@/common/decorators';
import { JwtAuthGuard, RolesGuard, IsOwnerGuard } from '@/common/guards';
import { User } from './entities/user.entity';
import type { Multer } from 'multer';
import { createFileUploadInterceptor } from '@/common/interceptors/file-upload.interceptor';

@UseInterceptors(RemovePasswordInterceptor)
@Controller('users') // /users
export class UserController {
  constructor(private readonly userService: UserService) {} // Dependency Injection

  /* --------------------------------------------------------------------
   * findAll
   * Get all users, optionally filter by role (?role=user|admin)
   * -------------------------------------------------------------------- */
  @Get() // GET /users or /users?role=value
  findAll(@Query('role') role?: 'user' | 'admin') {
    console.log('UserController > findAll');
    return this.userService.findAll(role);
  }

  /* --------------------------------------------------------------------
   * findOne
   * Get single user by ID (UUID format required)
   * -------------------------------------------------------------------- */
  @Get(':id') // GET /users/:id
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    console.log('UserController > findOne');
    return this.userService.findOne(id);
  }

  /* --------------------------------------------------------------------
   * create
   * Public route to create a new user
   * -------------------------------------------------------------------- */
  @Post() // POST /users
  create(@Body() createUserDto: CreateUserDto) {
    console.log('UserController > create');
    return this.userService.create(createUserDto);
  }

  /* --------------------------------------------------------------------
   * update
   * Update a user’s data – allowed for the user or an admin
   * Uses JwtAuthGuard + IsOwnerGuard
   * -------------------------------------------------------------------- */
  @UseGuards(JwtAuthGuard, IsOwnerGuard)
  @Patch(':id') // PATCH /users/:id
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: User,
  ) {
    console.log('UserController > update', updateUserDto, currentUser.id);
    return this.userService.update(id, updateUserDto);
  }

  /* --------------------------------------------------------------------
   * remove
   * Delete user – allowed for the user or an admin
   * Uses JwtAuthGuard + IsOwnerGuard
   * -------------------------------------------------------------------- */
  @UseGuards(JwtAuthGuard, IsOwnerGuard)
  @Delete(':id') // DELETE /users/:id
  remove(@Param('id', ParseUUIDPipe) id: string) {
    console.log('UserController > remove');
    return this.userService.remove(id);
  }

  /* --------------------------------------------------------------------
   * admin-dashboard
   * Secured route – accessible only to admin users with valid JWT
   * Uses JwtAuthGuard + RolesGuard + @Roles('admin')
   * -------------------------------------------------------------------- */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin-dashboard')
  getAdminData() {
    return 'RolesGuard passed: This route is Restricted to admins';
  }

  /* --------------------------------------------------------------------
   * uploadDocument
   * Use Custom FileUpload Interceptor
   * Upload a PDF or JPEG document for the user
   * Validates file type and size (max 5MB)
   * -------------------------------------------------------------------- */
  @UseInterceptors(createFileUploadInterceptor())
  @Post(':id/upload-document')
  uploadDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log('UserController > uploadDocument', file);
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return this.userService.uploadDocument(id, file);
  }

  /* --------------------------------------------------------------------
   * removeDocument
   * Deletes the user's uploaded document from S3
   * -------------------------------------------------------------------- */
  @Delete(':id/remove-document')
  removeDocument(@Param('id', ParseUUIDPipe) id: string) {
    console.log('UserController > removeDocument');
    return this.userService.removeDocument(id);
  }
}
