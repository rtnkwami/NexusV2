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

@Controller('users')
@Auth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  register(@CurrentUser() user: DecodedIdToken) {
    return this.usersService.register(user);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Get('me')
  getMyProfile(@CurrentUser() user: DecodedIdToken) {
    return user;
  }

  @Patch('me')
  update(
    @CurrentUser() user: DecodedIdToken,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(user.uid, updateUserDto);
  }

  @Delete('me')
  remove(@CurrentUser() user: DecodedIdToken) {
    return this.usersService.remove(user.uid);
  }
}
