import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserModel } from '@models';
import { AuthGuard } from '../auth/guards';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth('token')
  @ApiOperation({ summary: 'Получение списка всех пользователей' })
  @ApiResponse({ status: 200, description: 'Список пользователей', type: UserModel, isArray: true })
  @ApiResponse({ status: 401, description: 'Неавторизованный запрос' })
  async findAll(): Promise<UserModel[]> {
    return this.usersService.findAll();
  }
}