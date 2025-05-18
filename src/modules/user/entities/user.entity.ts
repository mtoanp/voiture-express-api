import { Exclude } from 'class-transformer';
import { Role } from '@prisma/client';

export class User {
  id: number;
  name: string;
  email: string;
  tel?: string;
  document?: string;
  role: Role;

  @Exclude()
  password: string;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
