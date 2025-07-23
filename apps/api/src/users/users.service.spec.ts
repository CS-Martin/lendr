import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersDbService } from './users.db.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto, UserDto } from '@repo/shared-dtos';

describe('UsersService', () => {
  let service: UsersService;

  const mockUsersDbService = {
    create: jest.fn().mockImplementation((data: CreateUserDto) => {
      if (data.address === 'createErrorAddress') {
        throw new BadRequestException('Failed to create user');
      }

      return Promise.resolve({
        address: data.address,
        username: data.username,
        avatarUrl: data.avatarUrl,
        bio: data.bio,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }),

    update: jest.fn().mockImplementation((address: string, data: UpdateUserDto) => {
      if (address === '1234567890') {
        return Promise.resolve({
          address: '1234567890',
          username: data.username,
          avatarUrl: data.avatarUrl,
          bio: data.bio,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      if (address === 'updateErrorAddress') {
        throw new BadRequestException('Failed to update user');
      }

      throw new NotFoundException('User not found');
    }),

    findAll: jest.fn().mockImplementation(() => {
      return Promise.resolve([
        {
          address: '1',
          username: 'Test User 1',
          avatarUrl: 'https://example.com/avatar1.jpg',
          bio: 'User 1 bio',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          address: '2',
          username: 'Test User 2',
          avatarUrl: 'https://example.com/avatar2.jpg',
          bio: 'User 2 bio',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
    }),

    findOne: jest.fn().mockImplementation((address: string) => {
      if (address === '1234567890') {
        return Promise.resolve({
          address: '1234567890',
          username: 'Test User',
          avatarUrl: 'https://example.com/avatar.jpg',
          bio: 'Test bio',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      if (address === 'existingAddress') {
        return Promise.resolve({
          address: 'existingAddress',
          username: 'Existing User',
          avatarUrl: 'https://example.com/existing-avatar.jpg',
          bio: 'Existing user bio',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      if (address === 'notFoundAddress') {
        return Promise.resolve(null);
      }

      if (address === 'errorAddress') {
        throw new BadRequestException('Failed to find user');
      }

      return Promise.resolve(null);
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersDbService,
          useValue: mockUsersDbService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeTruthy();
  });

  // Create user tests
  describe('create', () => {
    it('should create a user', async () => {
      const data: CreateUserDto = new CreateUserDto();
      data.address = '0x123abc';
      data.username = 'testuser';
      data.avatarUrl = 'https://example.com/avatar.jpg';
      data.bio = 'Test user bio';

      // Mock the findOne call to return null
      mockUsersDbService.findOne.mockResolvedValueOnce(null);
      // Mock the create call to return a user object
      mockUsersDbService.create.mockResolvedValueOnce({
        address: data.address,
        username: data.username,
        avatarUrl: data.avatarUrl,
        bio: data.bio,
      });

      const response = await service.create(data);

      expect(response.statusCode).toEqual(201);
      expect(response.data?.address).toEqual(data.address);
      expect(response.data?.username).toEqual(data.username);
      expect(response.message).toEqual('User created successfully');
    });

    it('should throw an error if user already exists', async () => {
      const data: CreateUserDto = new CreateUserDto();
      data.address = 'existingAddress';

      await expect(service.create(data)).rejects.toThrow(new BadRequestException('User already exists'));
    });

    it('should throw an error if user creation fails', async () => {
      const data: CreateUserDto = new CreateUserDto();
      data.address = 'createErrorAddress';
      data.username = 'testuser';
      data.avatarUrl = 'https://example.com/avatar.jpg';
      data.bio = 'Test user bio';

      // Mock findOne to return null
      mockUsersDbService.findOne.mockResolvedValueOnce(null);
      // Mock create to throw an error
      mockUsersDbService.create.mockRejectedValueOnce(new Error('Database error'));

      await expect(service.create(data)).rejects.toThrow(new BadRequestException('Failed to find user'));
    });
  });

  // Update user tests
  describe('update', () => {
    it('should update a user', async () => {
      const address = '1234567890';
      const updateData: UpdateUserDto = {
        username: 'Updated User',
        bio: 'Updated bio',
      };

      const response = await service.update(address, updateData);

      expect(response.statusCode).toEqual(200);
      expect(response.data?.username).toEqual(updateData.username);
      expect(response.data?.bio).toEqual(updateData.bio);
      expect(response.message).toEqual('User updated successfully');
    });

    it('should throw an error if user not found', async () => {
      const address = 'notFoundAddress';
      const updateData: UpdateUserDto = {
        username: 'Updated User',
        bio: 'Updated bio',
      };

      mockUsersDbService.findOne.mockResolvedValueOnce(null);

      await expect(service.update(address, updateData)).rejects.toThrow(new BadRequestException('Failed to find user'));
    });

    it('should throw an error if update fails', async () => {
      const address = 'updateErrorAddress';
      const updateData: UpdateUserDto = {
        username: 'Updated User',
      };

      // First make sure findOne returns a user
      mockUsersDbService.findOne.mockResolvedValueOnce({
        address: 'updateErrorAddress',
        username: 'Existing User',
        createdAt: new Date(),
      });

      await expect(service.update(address, updateData)).rejects.toThrow(
        new BadRequestException('Failed to update user'),
      );
    });
  });

  // Find all users tests
  describe('findAll', () => {
    it('should return all users', async () => {
      const response = await service.findAll();

      expect(response.statusCode).toEqual(200);
      expect(response.data?.length).toEqual(2);
      expect(response.message).toEqual('Users found successfully');
    });

    it('should throw an error if finding users fails', async () => {
      mockUsersDbService.findAll.mockRejectedValueOnce(new BadRequestException('Failed to find users'));

      await expect(service.findAll()).rejects.toThrow(new BadRequestException('Failed to find users'));
    });
  });

  // Find one user tests
  describe('findOne', () => {
    it('should return a user by address', async () => {
      const address = '1234567890';
      const response = await service.findOne(address);

      expect(response.statusCode).toEqual(200);
      expect(response.data?.address).toEqual(address);
      expect(response.message).toEqual('User found successfully');
    });

    it('should throw an error if user not found', async () => {
      const address = 'notFoundAddress';

      mockUsersDbService.findOne.mockResolvedValueOnce(null);

      await expect(service.findOne(address)).rejects.toThrow(new BadRequestException('Failed to find user'));
    });

    it('should throw an error if finding user fails', async () => {
      const address = 'errorAddress';

      await expect(service.findOne(address)).rejects.toThrow(new BadRequestException('Failed to find user'));
    });
  });

  // ConvertToUserDto tests
  describe('convertToUserDto', () => {
    it('should convert User to UserDto', () => {
      const user = {
        address: '123',
        username: 'test',
        avatarUrl: 'https://example.com/avatar.jpg',
        bio: 'test bio',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.convertToUserDto(user);

      expect(result).toBeInstanceOf(UserDto);
      expect(result.address).toEqual(user.address);
      expect(result.username).toEqual(user.username);
    });
  });
});
