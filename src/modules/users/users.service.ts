import { Repository } from 'typeorm';
import { hash } from 'bcrypt';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserModel } from '../../models/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserModel)
    private userRepository: Repository<UserModel>
  ) {}

  async create(signUp: Pick<UserModel, 'email' | 'password'>): Promise<UserModel> {
    if (!signUp.email || !signUp.password) {
      throw new BadRequestException('Email и пароль не могут быть пустыми');
    }

    if (typeof signUp.email !== 'string' || typeof signUp.password !== 'string') {
      throw new BadRequestException('Email и пароль должны быть строками');
    }

    const hashedPassword = await hash(signUp.password, 10);
    const newUser = this.userRepository.create({ email: signUp.email, password: hashedPassword });
    return this.userRepository.save(newUser);
  }

  async findOne(email: UserModel['email']): Promise<UserModel | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findAll(): Promise<Pick<UserModel, 'uuid' | 'email'>[]> {
    return this.userRepository.find({
      select: ['uuid', 'email']
    });
  }
}