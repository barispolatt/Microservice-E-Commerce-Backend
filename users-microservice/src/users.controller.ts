import { Controller, ParseIntPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationOptions } from '@ecommerce/common';

@Controller()
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @MessagePattern({ cmd: 'create_user' })
    createUser(@Payload() createUserDto: CreateUserDto) {
        return this.usersService.createUser(createUserDto);
    }

    @MessagePattern({ cmd: 'get_all_users' })
    findAll(@Payload() paginationOptions: PaginationOptions) {
        return this.usersService.findAll(paginationOptions);
    }

    @MessagePattern({ cmd: 'get_user_by_id' })
    findOne(@Payload('id', ParseIntPipe) id: number) {
        return this.usersService.findOneById(id);
    }

    @MessagePattern({ cmd: 'get_user_by_email' })
    findByEmail(@Payload('email') email: string) {
        return this.usersService.findByEmail(email);
    }

    @MessagePattern({ cmd: 'update_user' })
    update(
        @Payload('id', ParseIntPipe) id: number,
        @Payload('data') updateUserDto: UpdateUserDto,
    ) {
        return this.usersService.update(id, updateUserDto);
    }

    @MessagePattern({ cmd: 'delete_user' })
    remove(@Payload('id', ParseIntPipe) id: number) {
        return this.usersService.remove(id);
    }
}