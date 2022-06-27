import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, MaxLength, MinLength } from "class-validator";

export class ChangeProfileDto {
    @ApiProperty({ required: false })
    @IsOptional()
    name?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @ApiProperty({ type: 'string', format: 'binary', required: false })
    avatar?: Express.Multer.File;
}