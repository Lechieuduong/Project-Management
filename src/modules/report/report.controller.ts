import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateProjectReportDto } from './dto/create-report.dto';
import { ReportService } from './report.service';

@ApiTags('Report')
@Controller('report')
export class ReportController {
    constructor(
        private readonly reportService: ReportService) { }

    @Post('/create_project_report')
    createProjectReport(
        @Body() createProjectReportDto: CreateProjectReportDto
    ) {
        return this.reportService.createReportForProject(createProjectReportDto);
    }

    @Post('create_task_report/:id')
    createTaskReport(
        @Param('project-id') project_id: string
    ) {
        return this.reportService.createReportForTask(project_id);
    }
}
