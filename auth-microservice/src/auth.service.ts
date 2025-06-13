import { Inject, Injectable, UnauthorizedException, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { USERS_SERVICE, JwtPayload, UserResponseDto } from '@ecommerce/common';
import { User } from 'apps/users-microservice/src/database/entities/user.entity';

@Injectable()
export class AuthService implements OnModuleInit {
    constructor(
        @Inject(USERS_SERVICE) private readonly usersClient: ClientProxy,
        private readonly jwtService: JwtService,
    ) {}

    async onModuleInit() {
        // Establish connection to the users microservice on startup
        await this.usersClient.connect();
    }

    async login(loginDto: LoginDto) {
        const user: User = await firstValueFrom(
            this.usersClient.send({ cmd: 'get_user_by_email' }, { email: loginDto.email }),
        );

        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };

        const accessToken = this.jwtService.sign(payload);

        // We should not return the full user object with password.
        // Let's ask users-microservice for a safe DTO.
        const userDto: UserResponseDto = await this.getMe(user.id);

        return {
            accessToken,
            user: userDto,
        };
    }

    verifyToken(token: string): JwtPayload {
        try {
            return this.jwtService.verify<JwtPayload>(token);
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }

    async getMe(userId: number): Promise<UserResponseDto> {
        // This method is useful for refreshing user profile data and issuing a new token if needed.
        const user: User = await firstValueFrom(
            this.usersClient.send({ cmd: 'get_user_by_id' }, { id: userId }),
        );

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        // Return a safe DTO without the password
        const { password, ...result } = user;
        return result;
    }
}