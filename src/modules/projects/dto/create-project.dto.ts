import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsNotEmpty } from "class-validator";

export class CreateProjectDto {
    @ApiProperty()
    @IsNotEmpty()
    projectName: string;

    @ApiProperty()
    @IsNotEmpty()
    projectCode: string;

    @IsDate()
    @Type(() => Date)
    @ApiProperty({ type: 'string' })
    startDate: Date;

    @IsDate()
    @Type(() => Date)
    @ApiProperty({ type: 'string' })
    endDate: Date;

    @ApiProperty()
    @IsNotEmpty()
    costs: number;
}