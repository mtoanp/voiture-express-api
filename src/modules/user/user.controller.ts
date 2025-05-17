import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  ValidationPipe,
  UseInterceptors,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RemovePasswordInterceptor } from './interceptors/remove-password.interceptor';

@UseInterceptors(RemovePasswordInterceptor)
@Controller('users') // /users
export class UserController {
  // Dependency Injection
  constructor(private readonly userService: UserService) {}

  @Get() // GET /users or /users?role=value
  findAll(@Query('role') role?: 'user' | 'admin') {
    return this.userService.findAll(role);
  }

  @Get(':id') // GET /:id
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.findOne(id);
  }

  @Post() // POST /
  create(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Patch(':id') // PATCH /:id
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id') // DELETE /:id
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.remove(id);
  }
}

// @Param('id', ParseIntPipe) id: number)
// @Param('id', ParseUUIDPipe) id: string)
