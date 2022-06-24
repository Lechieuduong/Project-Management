import { ApiProperty } from "@nestjs/swagger";
import {
    IsEmail,
    IsIn,
    IsNotEmpty,
    Matches,
    MaxLength,
    MinLength
} from "class-validator";
import { UsersRole } from "../users.constants";

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

    @IsNotEmpty()
    @IsIn([UsersRole.SUPERADMIN, UsersRole.ADMIN, UsersRole.USER])
    role: UsersRole;
}