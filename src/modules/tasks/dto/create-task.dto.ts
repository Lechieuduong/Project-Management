import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateTaskDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    project_id?: string;

    @ApiProperty()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ required: false })
    description: string;

    @ApiProperty({ type: 'string', format: 'binary' })
    image?: Express.Multer.File;
}