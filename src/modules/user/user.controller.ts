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
import { FileInterceptor } from '@nestjs/platform-express';
import type { Multer } from 'multer';

@UseInterceptors(RemovePasswordInterceptor)
@Controller('users') // /users
export class UserController {
  // Dependency Injection
  constructor(private readonly userService: UserService) {}

  // ✅ Only accessible to admin users
  // → Requires valid JWT (JwtAuthGuard)
  // → Then checks user role via RolesGuard + @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin-dashboard')
  getAdminData() {
    return 'RolesGuard passed: This route is Restricted to admins';
  }

  // ✅ Secures the route by allowing any authenticated user with valid JWT
  // → JwtStrategy.validate() populates req.user, accessible via @CurrentUser()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() currentUser: User) {
    console.log('UserController > profile');
    return currentUser;
  }

  @Get() // GET /users or /users?role=value
  findAll(@Query('role') role?: 'user' | 'admin') {
    console.log('UserController > findAll');
    return this.userService.findAll(role);
  }

  @Get(':id') // GET /:id
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    console.log('UserController > findOne');
    return this.userService.findOne(id);
  }

  @Post() // POST /
  create(@Body() createUserDto: CreateUserDto) {
    console.log('UserController > create', createUserDto);
    return this.userService.create(createUserDto);
  }

  // ✅ Allows user to update their own data or admin to update anyone
  // → JwtAuthGuard validates identity
  // → IsOwnerGuard checks if req.user matches :id OR has admin role
  // @UseGuards(JwtAuthGuard, IsOwnerGuard)
  @UseGuards(JwtAuthGuard)
  @Patch(':id') // PATCH /:id
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: User,
  ) {
    console.log('UserController > update', updateUserDto, currentUser.id);
    return this.userService.update(id, updateUserDto);
  }

  // ✅ Same logic as update(): only the owner or an admin can delete a user
  @UseGuards(JwtAuthGuard, IsOwnerGuard)
  @Delete(':id') // DELETE /:id
  remove(@Param('id', ParseUUIDPipe) id: string) {
    console.log('UserController > remove');
    return this.userService.remove(id);
  }

  // upload document
  @Post(':id/upload-document')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max size
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf', 'image/jpeg'];
        if (!allowedTypes.includes(file.mimetype)) {
          return cb(new BadRequestException('Only PDF or JPEG allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  uploadDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log('uploadDocument', file);
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return this.userService.uploadDocument(id, file);
  }
}

// @Param('id', ParseIntPipe) id: number)
// @Param('id', ParseUUIDPipe) id: string)
// Body(ValidationPipe) createUserDto: CreateUserDto to validate individual fields
