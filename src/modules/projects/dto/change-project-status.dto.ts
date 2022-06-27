import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";
import { ProjectStatus } from "../projects.constants";

export class ChangeProjectStatusDto {
    @ApiProperty({ enum: ProjectStatus, required: false })
    @IsOptional()
    @IsEnum(ProjectStatus)
    status: ProjectStatus;
}