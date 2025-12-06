import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { auth } from 'src/auth/auth.config';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const user: Partial<User> = {
      id: createUserDto.uid,
      name: createUserDto.email,
      email: createUserDto.email,
    };

    if (createUserDto.picture) {
      user.avatar = createUserDto.picture;
    }

    await auth.setCustomUserClaims(createUserDto.uid, { roles: ['user'] });

    const registeredUser = this.userRepository.create(user);
    return this.userRepository.save(registeredUser);
  }

  findAll() {
    return this.userRepository.find();
  }

  findOne(id: string) {
    return this.userRepository.findOneBy({ id });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.userRepository.update(id, updateUserDto);
    return this.userRepository.findOneBy({ id });
  }

  async remove(id: string) {
    return this.userRepository.delete(id);
  }
}
