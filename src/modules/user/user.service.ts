import {
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

@Injectable()
export class UserService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly hashService: HashService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
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

  async findByEmail(email: string) {
    const user = await this.databaseService.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new NotFoundException(`User #${email} not found`);
    }
    return user;
  }

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

    return {
      access_token: token.access_token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
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
