import { ApiProperty } from "@nestjs/swagger";
import {
    IsEmail,
    IsNotEmpty,
    Matches,
    MaxLength,
    MinLength
} from "class-validator";

export class RegisterDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @ApiProperty()
    name: string;

    @ApiProperty()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(35)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'Your password so weak !!!',
    })
    password: string;
}