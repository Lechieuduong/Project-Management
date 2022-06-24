import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum } from "class-validator";
import { UsersRole } from "../users.constants";

export class ChangeRoleDto {
    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty({ description: 'User/Admin/Super Admin' })
    @IsEnum(UsersRole)
    role: UsersRole;
}