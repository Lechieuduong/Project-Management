import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthSummary } from './auth.constants';
import { AuthService } from './auth.service';
import AuthCreadentialsDto from './dto/auth-credentials.dto';
import TokenResponseDto from './dto/token-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('/signin')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: AuthSummary.SIGN_IN_SUMMARY })
    async signIn(
        @Body() authCreadentialsDto: AuthCreadentialsDto,
    ): Promise<TokenResponseDto> {
        return this.authService.signIn(authCreadentialsDto);
    }
}
