import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DatabaseService } from '@/core/database/database.service';
import { HashService } from '@/core/crypto/hash.service';
import { UserRole } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly hashService: HashService,
  ) {}

  async findAll(role?: 'user' | 'admin') {
    return this.databaseService.user.findMany({
      where: role ? { role } : undefined,
    });
  }

  async findOne(id: string) {
    const user = await this.verifyUserExists(id);
    return user;
  }

  async create(createUserDto: CreateUserDto) {
    const { password, ...rest } = createUserDto;

    // ✅ Securely hash the password
    const hashedPassword = await this.hashService.hash(password);

    return this.databaseService.user.create({
      data: {
        ...rest,
        password: hashedPassword,
        role: UserRole.USER, // set default role for user
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    // Optional: check existence
    await this.verifyUserExists(id);

    return this.databaseService.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: string) {
    await this.verifyUserExists(id);

    return this.databaseService.user.delete({
      where: { id },
    });
  }

  private async verifyUserExists(id: string) {
    const user = await this.databaseService.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
  }
}
