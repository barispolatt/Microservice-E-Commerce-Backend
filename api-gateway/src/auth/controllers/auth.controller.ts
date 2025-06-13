import { Controller, Post, Body, Inject, Get, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AUTH_SERVICE, USERS_SERVICE, UserResponseDto, JwtPayload } from '@ecommerce/common';
import { lastValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

// Assuming CreateUserDto is defined in the users-microservice DTOs
// but for simplicity in the gateway, we can redefine or import it.
// For this project, we'll assume the gateway knows about the CreateUserDto shape.
import { CreateUserDto } from 'apps/users-microservice/src/dto/create-user.dto';
import { LoginDto } from 'apps/auth-microservice/src/dto/login.dto';


@Controller('auth')
export class AuthController {
    constructor(
        @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
        @Inject(USERS_SERVICE) private readonly usersClient: ClientProxy,
    ) {}

    @Post('register')
    register(@Body() createUserDto: CreateUserDto) {
        return this.usersClient.send({ cmd: 'create_user' }, createUserDto);
    }

    @Post('login')
    login(@Body() loginDto: LoginDto) {
        return this.authClient.send({ cmd: 'login' }, loginDto);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    getMe(@CurrentUser() user: JwtPayload): Promise<UserResponseDto> {
        return lastValueFrom(this.authClient.send({ cmd: 'get_me' }, { userId: user.sub }));
    }
}