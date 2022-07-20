import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';
import { jwtConfig } from 'src/configs/configs.constants';
import { PassportModule } from '@nestjs/passport';
const passportModule = PassportModule.register({ defaultStrategy: 'jwt' });

@Module({
  imports: [
    passportModule,
    JwtModule.register({
      secret: jwtConfig.secret,
      signOptions: {
        expiresIn: jwtConfig.expiresIn,
      }
    }),
    TypeOrmModule.forFeature([UsersRepository, UserEntity])
  ],
  controllers: [UsersController],
  providers: [UsersService, JwtService],
  exports: [UsersService, passportModule],
})
export class UsersModule { }
