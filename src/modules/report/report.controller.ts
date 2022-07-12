import { Body, Controller, Get, Header, Param, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ExcelService } from 'src/excel/excel.service';
import { CreateProjectReportDto } from './dto/create-report.dto';
import { ReportService } from './report.service';

@ApiTags('Report')
@Controller('report')
export class ReportController {
    constructor(
        private readonly reportService: ReportService,
    ) { }

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

    @Get('/download/:id')
    @Header('Content-Type', 'text/xlsx')
    async downloadProjectReport(
        @Res() res: Response,
        @Param('id') id: string
    ) {
        let result = await this.reportService.downloadProjectExcel(id)
        res.download(`${result}`)
    }
}
