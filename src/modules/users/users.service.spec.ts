import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserModel } from '../../models/user.entity';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { SignUp } from '../auth';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
}));

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<UserModel>;

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserModel),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<UserModel>>(getRepositoryToken(UserModel));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Positive tests
  describe('create', () => {
    it('Positive: should create a new user with hashed password', async () => {
      // Preparation
      const signUpDto: SignUp = { email: 'test@example.com', password: 'password123' };
      const newUser = { uuid: 'test-uuid', email: 'test@example.com', password: 'hashed-password' };

      mockUserRepository.create.mockReturnValue(newUser);
      mockUserRepository.save.mockResolvedValue(newUser);

      // Action
      const result = await service.create(signUpDto);

      // Verification
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'hashed-password',
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(newUser);
      expect(result).toEqual(newUser);
    });
  });

  describe('findOne', () => {
    it('Positive: should find a user by email', async () => {
      // Preparation
      const user = { uuid: 'test-uuid', email: 'test@example.com', password: 'hashed-password' };
      mockUserRepository.findOne.mockResolvedValue(user);

      // Action
      const result = await service.findOne('test@example.com');

      // Verification
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(user);
    });
  });

  describe('findAll', () => {
    it('Positive: should return a list of all users', async () => {
      // Preparation
      const users = [
        { uuid: 'uuid1', email: 'user1@example.com' },
        { uuid: 'uuid2', email: 'user2@example.com' },
      ];
      mockUserRepository.find.mockResolvedValue(users);

      // Action
      const result = await service.findAll();

      // Verification
      expect(mockUserRepository.find).toHaveBeenCalledWith({
        select: ['uuid', 'email']
      });
      expect(result).toEqual(users);
    });
  });

  // Negative tests
  describe('create - negative cases', () => {
    it('Negative: should throw an exception if email is empty', async () => {
      // Preparation
      const signUpDto = { email: '', password: 'password123' } as SignUp;

      // Action and verification
      await expect(service.create(signUpDto)).rejects.toThrow(BadRequestException);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('Negative: should throw an exception if password is empty', async () => {
      // Preparation
      const signUpDto = { email: 'test@example.com', password: '' } as SignUp;

      // Action and verification
      await expect(service.create(signUpDto)).rejects.toThrow(BadRequestException);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('Negative: should throw an exception if email is not a string', async () => {
      // Preparation
      const signUpDto = { email: null, password: 'password123' } as any;

      // Action and verification
      await expect(service.create(signUpDto)).rejects.toThrow(BadRequestException);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('Negative: should throw an exception if password is not a string', async () => {
      // Preparation
      const signUpDto = { email: 'test@example.com', password: null } as any;

      // Action and verification
      await expect(service.create(signUpDto)).rejects.toThrow(BadRequestException);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('Negative: should handle error when hashing password', async () => {
      // Preparation
      const signUpDto: SignUp = { email: 'test@example.com', password: 'password123' };
      (bcrypt.hash as jest.Mock).mockRejectedValue(new Error('Hashing error'));

      // Action and verification
      await expect(service.create(signUpDto)).rejects.toThrow(Error);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('Negative: should handle error when saving user', async () => {
      // Preparation
      const signUpDto: SignUp = { email: 'test@example.com', password: 'password123' };
      const newUser = { uuid: 'test-uuid', email: 'test@example.com', password: 'hashed-password' };

      mockUserRepository.create.mockReturnValue(newUser);
      mockUserRepository.save.mockRejectedValue(new Error('Saving error'));

      // Action and verification
      await expect(service.create(signUpDto)).rejects.toThrow(Error);
    });
  });

  describe('findOne - negative cases', () => {
    it('Negative: should return null if user is not found', async () => {
      // Preparation
      mockUserRepository.findOne.mockResolvedValue(null);

      // Action
      const result = await service.findOne('nonexistent@example.com');

      // Verification
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      });
      expect(result).toBeNull();
    });

    it('Negative: should handle error when searching for a user', async () => {
      // Preparation
      mockUserRepository.findOne.mockRejectedValue(new Error('Search error'));

      // Action and verification
      await expect(service.findOne('test@example.com')).rejects.toThrow(Error);
    });
  });

  describe('findAll - negative cases', () => {
    it('Negative: should return an empty array if there are no users', async () => {
      // Preparation
      mockUserRepository.find.mockResolvedValue([]);

      // Action
      const result = await service.findAll();

      // Verification
      expect(mockUserRepository.find).toHaveBeenCalledWith({
        select: ['uuid', 'email']
      });
      expect(result).toEqual([]);
    });

    it('Negative: should handle error when getting the list of users', async () => {
      // Preparation
      mockUserRepository.find.mockRejectedValue(new Error('List retrieval error'));

      // Action and verification
      await expect(service.findAll()).rejects.toThrow(Error);
    });
  });
});