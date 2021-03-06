import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    forwardRef,
    HttpStatus,
    Inject,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterDto } from './dto/register.dto';
import { UsersRepository } from './users.repository';
import * as bcrypt from 'bcrypt'
import * as moment from 'moment';
import * as fs from 'fs';
import { v4 as uuid } from 'uuid'
import { SendMailService } from 'src/common/send-mail/send-mail.service';
import { UserEntity } from './entity/user.entity';
import { apiResponse } from 'src/common/api-response/apiresponse';
import { VerifyUserDto } from './dto/verify-user.dto';
import { UserMesssage, UsersRole } from './users.constants';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ChangeProfileDto } from './dto/change-profile.dto';
import { ChangeRoleDto } from './dto/change-role.dto';
import IJwtPayload from 'src/auth/payloads/jwt-payloads';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UsersRepository)
        private readonly userRepository: UsersRepository,

        @Inject(forwardRef(() => SendMailService))
        private sendMailService: SendMailService,
    ) { }

    async getByEmail(email: string): Promise<UserEntity> {
        const user = await this.userRepository.findOne({ email });
        if (!user) {
            return null;
        }
        return user;
    }

    async getUserById(id: string): Promise<UserEntity> {
        return this.userRepository.findOneById(id);
    }

    // Start of register and verify
    async register(registerDto: RegisterDto) {
        const { email, password, name } = registerDto;

        const newUser = new UserEntity();
        newUser.email = email;
        newUser.name = name;
        newUser.role = UsersRole.SUPERADMIN;
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);
        newUser.verify_code = uuid();
        newUser.password = hashedPassword;

        try {

            await this.userRepository.save(newUser);

            this.sendMailVerifyUser(email);

            return apiResponse(HttpStatus.CREATED, 'Create user successfully. Please check your email to verify user.', {})

        } catch (error) {

            if (error.code === '23505') {
                throw new ConflictException(UserMesssage.EMAIL_EXIST);
            }

            throw new InternalServerErrorException();
        }
    }

    async sendMailVerifyUser(email: string) {
        const user = await this.userRepository.findOne({ email });

        const currentDate = moment().format();

        if (!user)
            throw new NotFoundException(`User have email: ${email} not found.`);

        if (user.verified)
            throw new BadRequestException('Verified account.');

        if (user.created_at.getTime() !== user.updated_at.getTime()) {
            const time = new Date(currentDate).getTime() - user.updated_at.getTime();
            const getTimeSendMail = time / (100 * 60 * 5);

            if (getTimeSendMail < 1)
                throw new BadRequestException(
                    `Please wait about ${getTimeSendMail} minute.`,
                );
        }

        let url =
            process.env.DOMAIN + '/users/verified?email=' + email + '&verify_code=' + user.verify_code;

        this.sendMailService.sendMailVerify(url, email);

        user.updated_at = new Date(currentDate);
        await user.save();

        return apiResponse(HttpStatus.OK, 'Reset password successful', {})
    }

    async verifyUser(verifyUserDto: VerifyUserDto) {
        const { email, verify_code } = verifyUserDto;

        const user = await this.userRepository.findOne({ email });

        if (!user)
            throw new BadRequestException('Something wrong. please check again!');

        if (user.verified)
            throw new BadRequestException('User has been verified.');

        if (user.verify_code !== verify_code && verify_code !== null)
            throw new BadRequestException('Bad verify code');

        user.verified = true;
        user.verify_code = null;

        await user.save();

        return apiResponse(HttpStatus.OK, 'Verify user successfully.', {});
    }
    // End of register and verify


    // Start of forgot and verify
    async forgotAndChangePassword(forgotPasswor??to: ForgotPasswordDto) {
        const { email, verify_code, password, repeat_password } = forgotPasswor??to;

        const user = await this.userRepository.findOne({ email });

        if (!user)
            throw new NotFoundException('User is not exists.');

        if (user.verify_code !== verify_code && verify_code !== null)
            throw new BadRequestException('Bad verify code');

        if (password !== repeat_password) {
            throw new BadRequestException('Repeat password is not corrected');
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);

        user.password = hashedPassword;

        user.verify_code = null;

        await user.save();

        return apiResponse(HttpStatus.OK, 'Change password successfully.', {});
    }

    async sendMailForgotPassword(email: string) {
        const user = await this.userRepository.findOne({ email });

        if (!user)
            throw new NotFoundException(`User has email ${email}`);

        if (!user.verified) {
            throw new BadRequestException('Please verify your email.');
        }

        const time = new Date().getTime() - user.updated_at.getTime();
        const getTimeSendMail = time / (100 * 60 * 5);

        if (getTimeSendMail < 1) {
            throw new BadRequestException(`Please wait ${(1 - getTimeSendMail) * 5 * 60}s`);
        }

        user.verify_code = uuid();

        const url = process.env.DOMAIN + '/users/forgot-password?email=' + email + '&verify_code=' + user.verify_code;

        const res = await this.sendMailService.sendMailForgotPassword(url, email);

        user.updated_at = new Date();

        await user.save()

        return apiResponse(HttpStatus.OK, res.response, {})
    }
    // End of forgot and verify

    async changePassword(
        changePasswordDto: ChangePasswordDto,
        userData: UserEntity,
    ) {
        const { oldPassword, newPassword, verify_code } = changePasswordDto;

        const user = await this.getUserById(userData.id);

        if (await bcrypt.compare(oldPassword, user.password)) {
            const salt = await bcrypt.genSalt();

            const hashedPassword = await bcrypt.hash(newPassword, salt);

            user.password = hashedPassword;

            user.verify_code = null;

            await user.save()

            return apiResponse(HttpStatus.OK, 'Change password successfully.', {});
        } else {
            throw new BadRequestException('Your old password is wrong.');
        }
    }

    async sendMailChangePassword(email: string) {
        const user = await this.userRepository.findOne({ email });

        if (!user)
            throw new NotFoundException(`User has email ${email}is not found`);

        if (!user.verified) {
            throw new BadRequestException('Please verify your email.');
        }

        const time = new Date().getTime() - user.updated_at.getTime();
        const getTimeSendMail = time / (100 * 60 * 5);

        if (getTimeSendMail < 1) {
            throw new BadRequestException(`Please wait ${(1 - getTimeSendMail) * 5 * 60}s`);
        }

        user.verify_code = uuid();

        const url = process.env.DOMAIN + '/users/change_password?email=' + email + '&verify_code=' + user.verify_code;

        this.sendMailService.sendMailChangePassword(url, email);

        user.updated_at = new Date();

        await user.save();

        return apiResponse(HttpStatus.OK, 'Check your email to take verify code', {});
    }

    async changeProfile(
        changeProfileDto: ChangeProfileDto,
        userData: UserEntity,
        file: Express.Multer.File,
    ) {
        const checkUser = await this.userRepository.findOne({ email: userData.email });

        if (!checkUser)
            throw new NotFoundException(`User has email ${checkUser.email}is not found`);

        if (file) {
            if (fs.existsSync(checkUser.avatar)) {
                fs.unlinkSync(`./${checkUser.avatar}`);
            }
            checkUser.avatar = file.path;
        }

        const { email, name } = changeProfileDto;
        if (email !== null) {
            checkUser.email = email;
        }
        if (name !== null) {
            checkUser.name = name;
        }

        await this.userRepository.save(checkUser);

        return apiResponse(HttpStatus.OK, 'Change profile successful', {})
    }

    async changeRoleUSer(changeRoleDto: ChangeRoleDto) {
        const { email, role } = changeRoleDto;

        const user = await this.userRepository.findOne({ email });
        if (!user)
            throw new NotFoundException(`User email: ${email} is not found.`);

        user.role = role;
        await user.save();

        return apiResponse(HttpStatus.OK, 'Change role successfully', {});
    }

    async findUserByPayLoad(iJwtPayload: IJwtPayload): Promise<UserEntity> {
        const { email, role } = iJwtPayload;
        const user = await this.userRepository.findOne({ email, role });

        if (!user)
            throw new UnauthorizedException();

        if (!user.verified)
            throw new ForbiddenException(
                'Please check your email to verify account.',
            );
        return user;
    }
}
