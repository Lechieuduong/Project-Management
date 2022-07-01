import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional } from "class-validator";
import { ProjectStatus } from "src/modules/projects/projects.constants";
import { TaskPriority } from "../tasks.constants";

export class UpdateTaskDto {
    @ApiProperty({ required: false })
    @IsNotEmpty()
    @IsOptional()
    title: string;

    @ApiProperty({ required: false })
    @IsNotEmpty()
    @IsOptional()
    @IsEnum(ProjectStatus)
    type: ProjectStatus;

    @ApiProperty({ required: false })
    @IsNotEmpty()
    @IsOptional()
    @IsEnum(TaskPriority)
    priority: TaskPriority;

    @ApiProperty({ required: false })
    @IsNotEmpty()
    @IsOptional()
    description: string;

    @ApiProperty({ type: 'string', format: 'binary' })
    attachments?: Express.Multer.File;
}