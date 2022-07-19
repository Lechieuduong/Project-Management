import { Body, Controller, Delete, Get, Header, Param, Post, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from '../users/decorators/user-roles.decorator';
import { UserEntity } from '../users/entity/user.entity';
import { UsersRole } from '../users/users.constants';
import { CreateProjectReportDto } from './dto/create-report.dto';
import { ProjectReportEntity } from './entities/report.entity';
import { TaskReportEntity } from './entities/task-report';
import { ReportService } from './report.service';

@ApiTags('Report')
@Controller('reports')
export class ReportController {
    constructor(
        private readonly reportService: ReportService,
    ) { }

    //Project Report
    @Post('/create_project_report')
    @ApiBearerAuth()
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(UsersRole.ADMIN, UsersRole.SUPERADMIN)
    createProjectReport(
        @Body() createProjectReportDto: CreateProjectReportDto,
        @GetUser() user: UserEntity
    ) {
        return this.reportService.createReportForProject(createProjectReportDto, user);
    }

    @Get('/get_all_project_report')
    getAllProjectReports() {
        return this.reportService.getProjectReport();
    }

    @Get('/get_one_project_report/:id')
    getProjectReportByID(@Param('id') id: string): Promise<ProjectReportEntity> {
        return this.reportService.getProjectReportById(id);
    }

    @Delete('delete_project_report/:id')
    deleteProjectReport(
        @Param('id') id: string
    ) {
        return this.reportService.deleteProjectReport(id);
    }

    @Get('/download_project_report/:id')
    @Header('Content-Type', 'text/xlsx')
    async exportProjectReport(
        @Res() res: Response,
        @Param('id') id: string
    ) {
        let result = await this.reportService.exportProjectReport(id)
        res.download(`${result}`)
    }

    //Task Report
    @Post('create_task_report/:id')
    @ApiBearerAuth()
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(UsersRole.ADMIN, UsersRole.SUPERADMIN)
    createTaskReport(
        @Param('project-id') project_id: string
    ) {
        return this.reportService.createReportForTask(project_id);
    }

    @Get('/get_all_task_report')
    getAllTaskReports() {
        return this.reportService.getTaskReport();
    }

    @Get('/get_one_task_report/:id')
    getTaskReportByID(@Param('id') id: string): Promise<TaskReportEntity> {
        return this.reportService.getTaskReportById(id);
    }

    @Delete('delete_task_report/:id')
    deleteTaskeport(
        @Param('id') id: string
    ) {
        return this.reportService.deleteTaskReport(id);
    }


    @Get('/download_task_report/:id')
    @Header('Content-Type', 'text/xlsx')
    async exportTaskReport(
        @Res() res: Response,
        @Param('id') id: string
    ) {
        let result = await this.reportService.exportTaskReport(id)
        res.download(`${result}`)
    }
}
