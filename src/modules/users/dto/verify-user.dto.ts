import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class VerifyUserDto {
    @ApiProperty()
    @IsNotEmpty()
    email: string;

    @ApiProperty()
    @IsNotEmpty()
    verify_code: string;
}