import { Body, Controller, Get, Header, Param, Post, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from '../users/decorators/user-roles.decorator';
import { UserEntity } from '../users/entity/user.entity';
import { UsersRole } from '../users/users.constants';
import { CreateProjectReportDto } from './dto/create-report.dto';
import { ReportService } from './report.service';

@ApiTags('Report')
@Controller('reports')
export class ReportController {
    constructor(
        private readonly reportService: ReportService,
    ) { }

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

    @Post('create_task_report/:id')
    @ApiBearerAuth()
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(UsersRole.ADMIN, UsersRole.SUPERADMIN)
    createTaskReport(
        @Param('project-id') project_id: string
    ) {
        return this.reportService.createReportForTask(project_id);
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
