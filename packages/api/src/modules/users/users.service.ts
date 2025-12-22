import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { auth } from 'src/auth/auth.config';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from 'src/generated/prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async register(userData: CreateUserDto) {
    const user: Prisma.UserCreateInput = {
      id: userData.sub,
      email: userData.email,
      name: userData.email,
      avatar: userData.picture,
    };
    await auth.setCustomUserClaims(user.id, { roles: ['user'] });
    return this.prisma.user.create({ data: user });
  }

  searchUsers() {
    return this.prisma.user.findMany();
  }

  getUser(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async updateUserProfile(id: string, data: UpdateUserDto) {
    return this.prisma.user.update({ where: { id }, data });
  }

  async deleteUser(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
