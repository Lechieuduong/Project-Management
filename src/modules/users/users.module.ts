import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';
import { jwtConfig } from 'src/configs/configs.constants';
import { PassportModule } from '@nestjs/passport';
import { ProjectEntity } from '../projects/entity/project.entity';
const passportModule = PassportModule.register({ defaultStrategy: 'jwt' });

@Module({
  imports: [
    passportModule,
    JwtModule.register({
      secret: jwtConfig.secret,
      signOptions: {
        expiresIn: jwtConfig.expiresIn,
      } //, ProjectEntity
    }),
    TypeOrmModule.forFeature([UsersRepository, UserEntity])
  ],
  controllers: [UsersController],
  providers: [UsersService, JwtService],
  exports: [UsersService, passportModule],
})
export class UsersModule { }
