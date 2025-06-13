import { Controller, Get, Param, ParseIntPipe, Delete, Inject, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { USERS_SERVICE, UserRole } from '@ecommerce/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(@Inject(USERS_SERVICE) private readonly usersClient: ClientProxy) {}

    @Get()
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    findAll() {
        // In a real app, you'd pass pagination query params here
        return this.usersClient.send({ cmd: 'get_all_users' }, {});
    }

    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.usersClient.send({ cmd: 'get_user_by_id' }, { id });
    }

    @Delete(':id')
    @Roles(UserRole.SUPER_ADMIN)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.usersClient.send({ cmd: 'delete_user' }, { id });
    }
}