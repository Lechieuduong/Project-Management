import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, Matches, MaxLength, MinLength } from "class-validator";

export class ForgotPasswordDto {
    @ApiProperty()
    @IsNotEmpty()
    email: string;

    @ApiProperty()
    @IsNotEmpty()
    verify_code: string;

    @ApiProperty()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(35)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'Your password so weak !!!',
    })
    password: string;

    @ApiProperty()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(35)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'Your password so weak !!!',
    })
    repeat_password: string;
}