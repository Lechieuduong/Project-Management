import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class AssignUserDto {
    @ApiProperty()
    @IsNotEmpty()
    user_id: string

    @ApiProperty()
    @IsNotEmpty()
    task_id: string
}