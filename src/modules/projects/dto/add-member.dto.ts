import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNotEmpty } from "class-validator";
import { UsersRole } from "src/modules/users/users.constants";

export class AddMemberDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({ description: 'User/Admin/Super Admin' })
    @IsEnum(UsersRole)
    role: UsersRole;
}