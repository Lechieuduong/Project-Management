import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersRepository } from 'src/modules/users/users.repository';
import { UsersService } from 'src/modules/users/users.service';
import { AuthMessage } from './auth.constants';
import AuthCreadentialsDto from './dto/auth-credentials.dto';
import TokenResponseDto from './dto/token-response.dto';
import IJwtPayload from './payloads/jwt-payloads';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UsersRepository)
        private readonly userRepository: UsersRepository,
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }

    async signIn(authCredentialsDto: AuthCreadentialsDto): Promise<TokenResponseDto> {
        const { email, password } = authCredentialsDto;
        const user = await this.usersService.getByEmail(email);
        const newUser = await this.userRepository.findOne({ email })
        if (user && (await user.validatePassword(password))) {
            if (!newUser.verified) {
                throw new ForbiddenException(`Please check your email to verify user.`);
            }
            const payload: IJwtPayload = { email, role: user.role };

            const jwtAccessToken = await this.jwtService.signAsync(payload);
            delete user.password;
            return { jwtAccessToken, user };
        }

        throw new BadRequestException(AuthMessage.INVALID_CREDENTIALS);
    }
}
