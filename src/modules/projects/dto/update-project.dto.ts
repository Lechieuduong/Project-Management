import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsEnum, IsNotEmpty, IsOptional } from "class-validator";

export class UpdateProjectDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsNotEmpty()
    projectName?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNotEmpty()
    projectCode?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNotEmpty()
    @IsDate()
    @Type(() => Date)
    startDate?: Date;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNotEmpty()
    @IsDate()
    @Type(() => Date)
    endDate?: Date;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNotEmpty()
    costs?: number;
}