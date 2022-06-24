import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class SearchUserFilterDto {
    @ApiProperty({ required: false })
    @IsOptional()
    s: string;
}