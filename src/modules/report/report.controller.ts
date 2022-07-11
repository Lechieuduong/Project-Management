import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportService } from './report.service';

@ApiTags('Report')
@Controller('report')
export class ReportController {
    constructor(
        private readonly reportService: ReportService) { }

    @Post('/create_report')
    createReport(
        @Body() createReportDto: CreateReportDto
    ) {
        return this.reportService.createReport(createReportDto);
    }
}
