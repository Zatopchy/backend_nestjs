import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserModel } from '@models';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([UserModel])
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService]
})
export class UserModule {}
