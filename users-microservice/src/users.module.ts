import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './database/entities/user.entity';
import { BaseEntity } from './database/entities/base.entity';
import { BaseEntityWithName } from './database/entities/base-with-name.entity';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: './.env',
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get<string>('USERS_DB_HOST'),
                port: configService.get<number>('USERS_DB_PORT'),
                username: configService.get<string>('USERS_DB_USER'),
                password: configService.get<string>('USERS_DB_PASSWORD'),
                database: configService.get<string>('USERS_DB_NAME'),
                entities: [User, BaseEntity, BaseEntityWithName],
                synchronize: true, // Should be false in production
            }),
        }),
        TypeOrmModule.forFeature([User]),
    ],
    controllers: [UsersController],
    providers: [UsersService],
})
export class UsersModule {}