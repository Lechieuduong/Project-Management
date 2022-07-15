import { Body, Controller, Get, HttpCode, Param, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ChangeProfileDto } from './dto/change-profile.dto';
import { ChangeRoleDto } from './dto/change-role.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyUserDto } from './dto/verify-user.dto';
import { UserEntity } from './entity/user.entity';
import { UsersService } from './users.service';

@ApiTags('User')
@Controller('users')
export class UsersController {
    constructor(private userService: UsersService) { }

    @Get('/get_one_user/:id')
    getUserById(
        @Param('id') id: string
    ) {
        return this.userService.getUserById(id);
    }

    @Get('/verified')
    verifyUser(@Query() verifyUserDto: VerifyUserDto) {
        return this.userService.verifyUser(verifyUserDto);
    }

    @Post('/register')
    register(@Body() registerDto: RegisterDto) {
        return this.userService.register(registerDto);
    }

    @Post('/verified')
    sendMailVerifyUser(@Query('email') email: string) {
        return this.userService.sendMailVerifyUser(email);
    }

    @Post('/forgot_password')
    sendMailForgotPassword(@Query('email') email: string) {
        return this.userService.sendMailForgotPassword(email);
    }

    @Patch('/forgot_password')
    forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        return this.userService.forgotAndChangePassword(forgotPasswordDto);
    }

    @Post('/change_password')
    @ApiBearerAuth()
    @UseGuards(AuthGuard())
    sendMailChangePassword(@Query('email') email: string) {
        return this.userService.sendMailChangePassword(email);
    }

    @Patch('/change_password')
    @ApiBearerAuth()
    @UseGuards(AuthGuard())
    changePassword(
        @Body() changePasswordDto: ChangePasswordDto,
        @GetUser() user: UserEntity
    ) {
        return this.userService.changePassword(changePasswordDto, user);
    }

    @Patch('/update_profile')
    @ApiConsumes('multipart/form-data')
    // @ApiBody({
    //     schema: {
    //         type: 'object',
    //         properties: {
    //             comment: { type: 'string' },
    //             outletId: { type: 'integer' },
    //             file: {
    //                 type: 'string',
    //                 format: 'binary',
    //             },
    //         },
    //     },
    // })
    @ApiBearerAuth()
    @UseGuards(AuthGuard())
    @UseInterceptors(
        FileInterceptor('avatar', {
            storage: diskStorage({
                destination: './upload/avatar-img',
                filename: (req, file, cb) => {
                    const randomName = Array(32)
                        .fill(null)
                        .map(() => Math.round(Math.random() * 16).toString(16)).join('');
                    cb(null, `${randomName}${extname(file.originalname)}`);
                }
            })
        })
    ) changeProfile(
        @Body() changeProfileDto: ChangeProfileDto,
        @GetUser() user: UserEntity,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.userService.changeProfile(changeProfileDto, user, file);
    }

    @Patch('/change_role')
    @ApiBearerAuth()
    @UseGuards(AuthGuard())
    @HttpCode(200)
    changeRoleUser(@Body() changeRoleDto: ChangeRoleDto) {
        return this.userService.changeRoleUSer(changeRoleDto)
    }
}