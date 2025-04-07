import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UserModel } from '@models';
import { JwtPayload } from './types/jwt-payload';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser = {
    uuid: 'test-uuid',
    email: 'test@example.com',
    password: 'hashedPassword',
    toJSON: jest.fn().mockReturnThis(),
  } as UserModel;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('Positive: should register a new user', async () => {
      // Arrange
      const signUpDto = { email: 'new@example.com', password: 'password123' };
      const newUser = {
        ...mockUser,
        email: signUpDto.email,
        toJSON: jest.fn().mockReturnThis()
      };

      jest.spyOn(usersService, 'findOne').mockResolvedValue(null);
      jest.spyOn(usersService, 'create').mockResolvedValue(newUser);

      // Act
      const result = await authService.register(signUpDto);

      // Assert
      expect(usersService.findOne).toHaveBeenCalledWith(signUpDto.email);
      expect(usersService.create).toHaveBeenCalledWith(signUpDto);
      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe(signUpDto.email);
    });

    it('Negative: should throw UnauthorizedException if user already exists', async () => {
      // Arrange
      const signUpDto = { email: 'existing@example.com', password: 'password123' };
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);

      // Act & Assert
      await expect(authService.register(signUpDto)).rejects.toThrow(
        new UnauthorizedException('Этот пользователь уже зарегистрирован в системе')
      );
      expect(usersService.findOne).toHaveBeenCalledWith(signUpDto.email);
      expect(usersService.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('Positive: should return user when credentials are valid', async () => {
      // Arrange
      const signInDto = { email: 'test@example.com', password: 'correctPassword' };
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await authService.login(signInDto);

      // Assert
      expect(usersService.findOne).toHaveBeenCalledWith(signInDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(signInDto.password, mockUser.password);
      expect(result).toEqual(mockUser);
    });

    it('Negative: should throw UnauthorizedException when user not found', async () => {
      // Arrange
      const signInDto = { email: 'nonexistent@example.com', password: 'password123' };
      jest.spyOn(usersService, 'findOne').mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(signInDto)).rejects.toThrow(
        new UnauthorizedException('Неверный email или пароль')
      );
      expect(usersService.findOne).toHaveBeenCalledWith(signInDto.email);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('Negative: should throw UnauthorizedException when password is incorrect', async () => {
      // Arrange
      const signInDto = { email: 'test@example.com', password: 'wrongPassword' };
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(authService.login(signInDto)).rejects.toThrow(
        new UnauthorizedException('Неверный email или пароль')
      );
      expect(usersService.findOne).toHaveBeenCalledWith(signInDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(signInDto.password, mockUser.password);
    });
  });

  describe('verifyPayload', () => {
    it('Positive: should return user when payload is valid', async () => {
      // Arrange
      const now = Math.floor(Date.now() / 1000);
      const payload: JwtPayload = {
        sub: 'test@example.com',
        iat: now,
        exp: now + 3600
      };

      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);

      // Act
      const result = await authService.verifyPayload(payload);

      // Assert
      expect(usersService.findOne).toHaveBeenCalledWith(payload.sub);
      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe(payload.sub);
    });

    it('Negative: should throw UnauthorizedException when user not found', async () => {
      // Arrange
      const now = Math.floor(Date.now() / 1000);
      const payload: JwtPayload = {
        sub: 'nonexistent@example.com',
        iat: now,
        exp: now + 3600
      };

      jest.spyOn(usersService, 'findOne').mockImplementation(() => {
        throw new Error('User not found');
      });

      // Act & Assert
      await expect(authService.verifyPayload(payload)).rejects.toThrow(
        new UnauthorizedException(`Пользователь не найден: ${payload.sub}`)
      );
      expect(usersService.findOne).toHaveBeenCalledWith(payload.sub);
    });
  });

  describe('signToken', () => {
    it('Positive: should return JWT token', () => {
      // Arrange
      const mockToken = 'jwt-token';
      jest.spyOn(jwtService, 'sign').mockReturnValue(mockToken);

      // Act
      const result = authService.signToken(mockUser);

      // Assert
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: mockUser.email });
      expect(result).toBe(mockToken);
    });

    it('Negative: should throw error when JWT service fails', () => {
      // Arrange
      jest.spyOn(jwtService, 'sign').mockImplementation(() => {
        throw new Error('JWT error');
      });

      // Act & Assert
      expect(() => authService.signToken(mockUser)).toThrow('JWT error');
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: mockUser.email });
    });
  });
});