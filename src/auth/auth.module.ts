import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/modules/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from 'src/configs/configs.constants';
import { JwtStrategy } from './stategies/jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRepository } from 'src/modules/users/users.repository';
import { UserEntity } from 'src/modules/users/entity/user.entity';

const passportModule = PassportModule.register({ defaultStrategy: 'jwt' });

@Module({
  imports: [
    passportModule,
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConfig.secret,
      signOptions: {
        expiresIn: jwtConfig.expiresIn,
      },
    }),
    TypeOrmModule.forFeature([UsersRepository, UserEntity])
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, passportModule],
})
export class AuthModule { }
