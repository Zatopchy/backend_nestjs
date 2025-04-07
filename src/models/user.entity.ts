import { instanceToPlain, Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class UserModel {
  @ApiProperty({ example: 'c29a3258-4c6b-44dd-b276-277567884466', description: 'UUID' })
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @ApiProperty({ example: 'user@example.com', description: 'Email пользователя' })
  @Column({ unique: true })
  email: string;

  @Exclude({ toPlainOnly: true })
  @Column()
  password: string;

  toJSON() {
    return instanceToPlain(this);
  }
}