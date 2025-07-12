import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersDbService } from './users.db.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { User } from '@prisma/client';
import { NotFoundException, BadRequestException } from '@nestjs/common';


describe('UsersService', () => {
    let service: UsersService;
    let usersDbService: jest.Mocked<UsersDbService>;

    const mockUser: User = {
        address: '0x123...',
        username: 'testuser',
        avatarUrl: 'https://example.com/avatar.png',
        bio: 'Test user',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockUserDto: UserDto = new UserDto();
    mockUserDto.address = mockUser.address;
    mockUserDto.username = mockUser.username;
    mockUserDto.avatarUrl = mockUser.avatarUrl;
    mockUserDto.bio = mockUser.bio;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: UsersDbService,
                    useValue: {
                        create: jest.fn(),
                        update: jest.fn(),
                        findAll: jest.fn(),
                        findOne: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        usersDbService = module.get(UsersDbService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        const createUserDto: CreateUserDto = {
            address: mockUser.address,
            username: mockUser.username,
            avatarUrl: mockUser.avatarUrl,
            bio: mockUser.bio,
        };

        it('should create a new user', async () => {
            usersDbService.create.mockResolvedValue(mockUser);

            const result = await service.create(createUserDto);

            expect(usersDbService.create).toHaveBeenCalledWith(createUserDto);
            expect(result).toEqual({
                statusCode: 201,
                data: mockUserDto,
                message: 'User created successfully',
            });
        });

        it('should throw BadRequestException when creation fails', async () => {
            usersDbService.create.mockRejectedValue(new Error('Database error'));

            await expect(service.create(createUserDto)).rejects.toThrow(BadRequestException);
        });
    });

    describe('update', () => {
        const updateUserDto: UpdateUserDto = {
            username: 'updateduser',
            avatarUrl: 'https://example.com/new-avatar.png',
            bio: 'Updated bio',
        };

        it('should update an existing user', async () => {
            usersDbService.update.mockResolvedValue(mockUser);

            const result = await service.update(mockUser.address, updateUserDto);

            expect(usersDbService.update).toHaveBeenCalledWith(
                mockUser.address,
                updateUserDto,
            );
            expect(result).toEqual({
                statusCode: 200,
                data: mockUserDto,
                message: 'User updated successfully',
            });
        });

        it('should throw NotFoundException when user does not exist', async () => {
            usersDbService.update.mockResolvedValue(null);

            await expect(service.update(mockUser.address, updateUserDto))
                .rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException when update fails', async () => {
            usersDbService.update.mockRejectedValue(new Error('Database error'));

            await expect(service.update(mockUser.address, updateUserDto))
                .rejects.toThrow(BadRequestException);
        });
    });

    describe('findAll', () => {
        const mockUsers: User[] = [mockUser, { ...mockUser, address: '0x456...' }];
        const mockUserDtos: UserDto[] = [mockUserDto, { ...mockUserDto, address: '0x456...' }];

        it('should return all users', async () => {
            usersDbService.findAll.mockResolvedValue(mockUsers);

            const result = await service.findAll();

            expect(usersDbService.findAll).toHaveBeenCalled();
            expect(result).toEqual({
                statusCode: 200,
                data: mockUserDtos,
                message: 'Users found successfully',
            });
        });

        it('should return empty array when no users exist', async () => {
            usersDbService.findAll.mockResolvedValue([]);

            const result = await service.findAll();

            expect(result.data).toEqual([]);
            expect(result.statusCode).toBe(200);
        });

        it('should throw BadRequestException when finding users fails', async () => {
            usersDbService.findAll.mockRejectedValue(new Error('Database error'));

            await expect(service.findAll()).rejects.toThrow(BadRequestException);
        });
    });

    describe('findOne', () => {
        it('should return a single user', async () => {
            usersDbService.findOne.mockResolvedValue(mockUser);

            const result = await service.findOne(mockUser.address);

            expect(usersDbService.findOne).toHaveBeenCalledWith(mockUser.address);
            expect(result).toEqual({
                statusCode: 200,
                data: mockUserDto,
                message: 'User found successfully',
            });
        });

        it('should throw NotFoundException when user does not exist', async () => {
            usersDbService.findOne.mockResolvedValue(null);

            await expect(service.findOne(mockUser.address))
                .rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException when finding user fails', async () => {
            usersDbService.findOne.mockRejectedValue(new Error('Database error'));

            await expect(service.findOne(mockUser.address))
                .rejects.toThrow(BadRequestException);
        });
    });

    describe('convertToUserDto', () => {
        it('should convert User to UserDto', () => {
            const result = service.convertToUserDto(mockUser);
            expect(result).toEqual(mockUserDto);
        });

        it('should throw NotFoundException when user is null', () => {
            expect(() => service.convertToUserDto(null)).toThrow(NotFoundException);
        });
    });
});
