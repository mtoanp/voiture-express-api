import { Exclude } from 'class-transformer';

export class UserEntity {
  id: number;
  name: string;
  email: string;

  @Exclude()
  password: string;

  // Add other fields here, or use Partial<> if dynamic
  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
