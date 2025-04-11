import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards';
import { UsersService } from './users.service';
import { User } from './dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth('token')
  @ApiOperation({ summary: 'Получение списка всех пользователей' })
  @ApiResponse({ status: 200, description: 'Список пользователей', type: User, isArray: true })
  @ApiResponse({ status: 401, description: 'Неавторизованный запрос' })
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }
}