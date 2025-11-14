import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  register(createUserDto: CreateUserDto) {
    const user: Partial<User> = {
      name: createUserDto.email,
      email: createUserDto.email,
    };

    if (createUserDto.picture) {
      user.avatar = createUserDto.picture;
    }

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
