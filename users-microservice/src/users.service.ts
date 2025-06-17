import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './database/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationOptions, UserResponseDto, PaginatedResult } from '@ecommerce/common';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    private toResponseDto(user: User): UserResponseDto {
        const { password, ...result } = user;
        return result;
    }

    async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
        const existingUser = await this.userRepository.findOneBy({ email: createUserDto.email });
        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        const newUser = this.userRepository.create({
            ...createUserDto,
            password: hashedPassword,
        });

        const savedUser = await this.userRepository.save(newUser);
        return this.toResponseDto(savedUser);
    }

    // FIX: Implemented correct pagination logic.
    async findAll(options: PaginationOptions): Promise<PaginatedResult<UserResponseDto>> {
        const page = options.page || 1;
        const limit = options.limit || 10;

        const [users, total] = await this.userRepository.findAndCount({
            take: limit,
            skip: (page - 1) * limit,
            order: {
                created_at: 'DESC' // Default ordering
            }
        });

        const data = users.map(user => this.toResponseDto(user));

        return {
            data,
            total,
            page,
            limit,
        };
    }

    async findOneById(id: number): Promise<User> {
        const user = await this.userRepository.findOneBy({ id });
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    // ... (rest of the file remains the same) ...
    async findOneByIdWithPassword(id: number): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id },
            select: ['id', 'name', 'email', 'password', 'role', 'is_active', 'birthdate', 'created_at', 'updated_at'],
        });
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({
            where: { email },
            select: ['id', 'name', 'email', 'password', 'role', 'is_active', 'birthdate', 'created_at', 'updated_at'],
        });
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
        const user = await this.findOneById(id);

        if (updateUserDto.password) {
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
        }

        Object.assign(user, updateUserDto);
        const updatedUser = await this.userRepository.save(user);
        return this.toResponseDto(updatedUser);
    }

    async remove(id: number): Promise<{ message: string }> {
        const result = await this.userRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return { message: `User with ID ${id} successfully deleted` };
    }
}