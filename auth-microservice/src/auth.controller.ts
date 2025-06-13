import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from '@ecommerce/common';

@Controller()
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @MessagePattern({ cmd: 'login' })
    login(@Payload() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @MessagePattern({ cmd: 'verify_token' })
    verifyToken(@Payload('token') token: string): JwtPayload {
        return this.authService.verifyToken(token);
    }

    @MessagePattern({ cmd: 'get_me' })
    getMe(@Payload('userId') userId: number) {
        return this.authService.getMe(userId);
    }
}