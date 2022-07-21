import {
    Body,
    Controller,
    Delete,
    Get,
    Header,
    Param,
    Post,
    Res,
    UseGuards
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from '../users/decorators/user-roles.decorator';
import { UserEntity } from '../users/entity/user.entity';
import { UsersRole } from '../users/users.constants';
import { CreateProjectReportDto } from './dto/create-report.dto';
import { CreateTaskReportDto } from './dto/create-task-report.dto';
import { ProjectReportEntity } from './entities/report.entity';
import { TaskReportEntity } from './entities/task-report';
import { ReportService } from './report.service';

@ApiTags('Report')
@Controller('reports')
export class ReportController {
    constructor(private readonly reportService: ReportService) { }

    //Project Report
    @Post('/create-project-report')
    @ApiBearerAuth()
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(UsersRole.ADMIN, UsersRole.SUPERADMIN)
    createProjectReport(
        @Body() createProjectReportDto: CreateProjectReportDto,
        @GetUser() user: UserEntity
    ) {
        return this.reportService.createReportForProject(createProjectReportDto, user);
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(UsersRole.ADMIN, UsersRole.SUPERADMIN)
    @Get('/get-all-project-report')
    getAllProjectReports() {
        return this.reportService.getProjectReport();
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(UsersRole.ADMIN, UsersRole.SUPERADMIN)
    @Get('/get-one-project-report/:id')
    getProjectReportByID(@Param('id') id: string): Promise<ProjectReportEntity> {
        return this.reportService.getProjectReportById(id);
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(UsersRole.ADMIN, UsersRole.SUPERADMIN)
    @Delete('delete-project-report/:id')
    deleteProjectReport(
        @Param('id') id: string
    ) {
        return this.reportService.deleteProjectReport(id);
    }

    @Get('/download-project-report/:id')
    @Header('Content-Type', 'text/xlsx')
    async exportProjectReport(
        @Res() res: Response,
        @Param('id') id: string
    ) {
        let result = await this.reportService.exportProjectReport(id)
        res.download(`${result}`)
    }

    //Task Report
    @Post('create-task-report')
    @ApiBearerAuth()
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(UsersRole.ADMIN, UsersRole.SUPERADMIN)
    createTaskReport(
        @Body() createTaskReportDto: CreateTaskReportDto
    ) {
        return this.reportService.createReportForTask(createTaskReportDto);
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(UsersRole.ADMIN, UsersRole.SUPERADMIN)
    @Get('/get-all-task-report')
    getAllTaskReports() {
        return this.reportService.getTaskReport();
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(UsersRole.ADMIN, UsersRole.SUPERADMIN)
    @Get('/get-one-task-report/:id')
    getTaskReportByID(@Param('id') id: string): Promise<TaskReportEntity> {
        return this.reportService.getTaskReportById(id);
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(UsersRole.ADMIN, UsersRole.SUPERADMIN)
    @Delete('delete-task-report/:id')
    deleteTaskeport(
        @Param('id') id: string
    ) {
        return this.reportService.deleteTaskReport(id);
    }

    @Get('/download-task-report/:id')
    @Header('Content-Type', 'text/xlsx')
    async exportTaskReport(
        @Res() res: Response,
        @Param('id') id: string
    ) {
        let result = await this.reportService.exportTaskReport(id)
        res.download(`${result}`)
    }
}
