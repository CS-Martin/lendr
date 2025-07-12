import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersDbService } from './users.db.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersService', () => {
    let service: UsersService;

    const mockUsersDbService = {
        create: jest.fn().mockImplementation((data: CreateUserDto) => {
            if (data.address === 'errorAddress') {
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

        update: jest
            .fn()
            .mockImplementation((address: string, data: UpdateUserDto) => {
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

                throw new BadRequestException('User not found');
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
                return new NotFoundException('User not found');
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

            // Mock the findOne call to return null (user doesn't exist)
            mockUsersDbService.findOne.mockResolvedValueOnce(null);

            const response = await service.create(data);

            expect(response.statusCode).toEqual(201);
            expect(response.data?.address).toEqual(data.address);
            expect(response.data?.username).toEqual(data.username);
        });

        it('should throw an error if user already exists', async () => {
            const data: CreateUserDto = new CreateUserDto();

            data.address = 'existingAddress';

            await expect(service.create(data)).rejects.toThrow(
                new BadRequestException('User already exists'),
            );
        });

        it('should throw an error if user creation fails', async () => {
            const data: CreateUserDto = new CreateUserDto();
            data.address = 'errorAddress';
            data.username = 'testuser';
            data.avatarUrl = 'https://example.com/avatar.jpg';
            data.bio = 'Test user bio';

            // Make findOne return null, so it passes the existence check
            mockUsersDbService.findOne.mockResolvedValueOnce(null);

            // Now simulate failure during creation
            mockUsersDbService.create.mockRejectedValueOnce(
                new BadRequestException('Failed to create user'),
            );

            await expect(service.create(data)).rejects.toThrow(
                new BadRequestException('Failed to create user'),
            );
        });
    });
});
