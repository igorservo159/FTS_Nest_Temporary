import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  HttpException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getAllUsers() {
    return await this.usersService.getAllUsers();
  }

  @Get(':uid')
  async getUserByUid(@Param('uid') uid: string) {
    return await this.usersService.getUserByUid(uid);
  }

  @Post('create')
  async create(@Body() createMepDto: CreateUserDto) {
    try {
      this.usersService.createUserInFirebase(createMepDto);
    } catch (error) {
      return new HttpException(error, 400);
    }
  }
}
