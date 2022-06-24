import { Body, Controller, Get, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyUserDto } from './dto/verify-user.dto';
import { UserEntity } from './entity/user.entity';
import { UsersService } from './users.service';

@ApiTags('User')
@Controller('users')
export class UsersController {
    constructor(private userService: UsersService) { }

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
}