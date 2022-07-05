import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional } from "class-validator";
import { ProjectStatus } from "src/modules/projects/projects.constants";
import { TaskPriority } from "../tasks.constants";

export class UpdateTaskDto {
    @ApiProperty({ required: false })
    @IsNotEmpty()
    @IsOptional()
    title?: string;

    @ApiProperty({ enum: ProjectStatus, required: false })
    @IsNotEmpty()
    @IsOptional()
    @IsEnum(ProjectStatus)
    type?: ProjectStatus;

    @ApiProperty({ required: false })
    @IsNotEmpty()
    @IsOptional()
    description?: string;

    @ApiProperty({ enum: TaskPriority, required: false })
    @IsNotEmpty()
    @IsOptional()
    @IsEnum(TaskPriority)
    priority?: TaskPriority;

    @ApiProperty({ type: 'string', format: 'binary', required: false })
    image?: Express.Multer.File;

    @ApiProperty({ type: 'string', format: 'binary', required: false })
    attachments?: Array<Express.Multer.File>;
}