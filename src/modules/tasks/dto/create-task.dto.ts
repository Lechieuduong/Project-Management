import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CreateTaskDto {
    @ApiProperty()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ required: false })
    description: string;

    @ApiProperty({ type: 'string', format: 'binary' })
    image?: Express.Multer.File;
}