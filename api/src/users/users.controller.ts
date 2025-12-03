import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
// import type { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { Auth } from 'src/auth/auth.decorator';
import { CurrentUser } from 'src/auth/user.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller({
  path: 'users',
})
@Auth('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  register(@CurrentUser() user: CreateUserDto) {
    return this.usersService.register(user);
  }

  @Get()
  @Auth('admin')
  searchUsers() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Auth('admin')
  getUser(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Get('me')
  getMyProfile(@CurrentUser() user: DecodedIdToken) {
    return user;
  }

  @Patch('me')
  updateMyProfile(
    @CurrentUser() user: DecodedIdToken,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(user.sub, updateUserDto);
  }

  @Delete('me')
  deleteMyAccount(@CurrentUser() user: DecodedIdToken) {
    return this.usersService.remove(user.sub);
  }
}
