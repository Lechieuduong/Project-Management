import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, MaxLength, MinLength } from "class-validator";

export class ChangeProfileDto {
    @ApiProperty()
    @IsOptional()
    name: string;

    @ApiProperty()
    @IsOptional()
    @IsEmail()
    email: string;
}