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
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RemovePasswordInterceptor } from './interceptors/remove-password.interceptor';
import { CurrentUser, Roles } from '@/common/decorators';
import { JwtAuthGuard, RolesGuard, IsOwnerGuard } from '@/common/guards';

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
  getProfile(@CurrentUser() user: any) {
    return user;
  }

  @Get() // GET /users or /users?role=value
  findAll(@Query('role') role?: 'user' | 'admin') {
    return this.userService.findAll(role);
  }

  @Get(':id') // GET /:id
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.findOne(id);
  }

  @Post() // POST /
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  // ✅ Allows user to update their own data or admin to update anyone
  // → JwtAuthGuard validates identity
  // → IsOwnerGuard checks if req.user matches :id OR has admin role
  @UseGuards(JwtAuthGuard, IsOwnerGuard)
  @Patch(':id') // PATCH /:id
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  // ✅ Same logic as update(): only the owner or an admin can delete a user
  @UseGuards(JwtAuthGuard, IsOwnerGuard)
  @Delete(':id') // DELETE /:id
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.remove(id);
  }
}

// @Param('id', ParseIntPipe) id: number)
// @Param('id', ParseUUIDPipe) id: string)
// Body(ValidationPipe) createUserDto: CreateUserDto to validate individual fields
