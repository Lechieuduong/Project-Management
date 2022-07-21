import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateTaskReportDto {
    @ApiProperty()
    @IsString()
    project_id: string;
}