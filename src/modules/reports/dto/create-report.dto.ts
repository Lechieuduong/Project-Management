import { ApiProperty } from "@nestjs/swagger";

export class CreateProjectReportDto {
    @ApiProperty()
    numOfMember: number;

    @ApiProperty()
    totalMember: number;
}
