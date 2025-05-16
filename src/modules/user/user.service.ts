import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DatabaseService } from '@/core/database/database.service';

@Injectable()
export class UserService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(role?: 'user' | 'admin') {
    return this.databaseService.user.findMany({
      where: role ? { role } : undefined,
    });
  }

  async findOne(id: number) {
    const user = await this.databaseService.user.findUnique({
      where: { id },
    });
    if (!user) throw new NotFoundException(`User #${id} not found`);
    return user;
  }

  async create(createUserDto: CreateUserDto) {
    return this.databaseService.user.create({
      data: createUserDto,
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    // Optional: check existence
    const user = await this.databaseService.user.findUnique({
      where: { id },
    });
    if (!user) throw new NotFoundException(`user #${id} not found`);

    return this.databaseService.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: number) {
    const user = await this.databaseService.user.findUnique({
      where: { id },
    });
    if (!user) throw new NotFoundException(`user #${id} not found`);

    return this.databaseService.user.delete({
      where: { id },
    });
  }
}
