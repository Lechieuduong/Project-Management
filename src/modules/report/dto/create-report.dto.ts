import { ApiProperty } from "@nestjs/swagger";

export class CreateReportDto {
    @ApiProperty()
    numOfMember: number;

    @ApiProperty()
    totalMember: number;
}