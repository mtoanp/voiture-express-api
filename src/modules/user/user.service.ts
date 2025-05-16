import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  private users = [
    {
      id: 1,
      name: 'Alice Johnson',
      email: 'alice.johnson@example.com',
      role: 'admin',
    },
    {
      id: 2,
      name: 'Bob Smith',
      email: 'bob.smith@example.com',
      role: 'user',
    },
    {
      id: 3,
      name: 'Charlie Lee',
      email: 'charlie.lee@example.com',
      role: 'user',
    },
    {
      id: 4,
      name: 'Dana White',
      email: 'dana.white@example.com',
      role: 'admin',
    },
    {
      id: 5,
      name: 'Evan Kim',
      email: 'evan.kim@example.com',
      role: 'user',
    },
  ];

  findAll(role?: 'user' | 'admin') {
    if (role) {
      return this.users.filter((user) => user.role === role);
    } else {
      return this.users;
    }
  }

  findOne(id: number) {
    const user = this.users.find((user) => user.id === id);
    if (!user) throw new NotFoundException();
    return user;
  }

  create(createUserDto: CreateUserDto) {
    const userByHighestId = [...this.users].sort((a, b) => b.id - a.id);
    const highestId = userByHighestId.length > 0 ? userByHighestId[0].id : 0;

    const newUser = {
      id: highestId + 1,
      ...createUserDto,
    };

    this.users.push(newUser);
    return newUser;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    const index = this.users.findIndex((user) => user.id === id);
    if (index === -1) {
      throw new NotFoundException();
    }

    this.users[index] = {
      ...this.users[index],
      ...updateUserDto,
    };

    return this.users[index];
  }

  remove(id: number) {
    const removeUser = this.users.find((user) => user.id === id);
    this.users = this.users.filter((user) => user.id !== id);
    return this.users;
  }
}
