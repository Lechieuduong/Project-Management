import {
    BadRequestException,
    HttpStatus,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Workbook } from 'exceljs';
import { apiResponse } from 'src/common/api-response/apiresponse';
import { createQueryBuilder, Repository } from 'typeorm';
import { ProjectInviteMember } from '../projects/entity/project-invite-member.entity';
import { ProjectStatus, ProjectType } from '../projects/projects.constants';
import { ProjectsRepository } from '../projects/projects.repository';
import { TasksRepository } from '../tasks/tasks.repository';
import { CreateProjectReportDto } from './dto/create-report.dto';
import { ProjectReportRepository } from './repository/report.repository';
import { TaskReportRepository } from './repository/task-report.repository';
import * as tmp from 'tmp';
import { TaskEntity } from '../tasks/entity/task.entity';
import { ProjectEntity } from '../projects/entity/project.entity';
import { UserEntity } from '../users/entity/user.entity';
import { ProjectReportEntity } from './entities/report.entity';
import { TaskReportEntity } from './entities/task-report';
import { CreateTaskReportDto } from './dto/create-task-report.dto';

@Injectable()
export class ReportService {
    constructor(
        @InjectRepository(ProjectReportRepository)
        private readonly projectReportRepository: ProjectReportRepository,

        @InjectRepository(ProjectsRepository)
        private readonly projectRepository: ProjectsRepository,

        @InjectRepository(ProjectInviteMember)
        private readonly projectInviteMember: Repository<ProjectInviteMember>,

        @InjectRepository(TasksRepository)
        private readonly taskRepository: TasksRepository,

        @InjectRepository(TaskReportRepository)
        private readonly taskReportRepository: TaskReportRepository,
    ) { }

    //Project Report
    async createReportForProject(createProjectReportDto: CreateProjectReportDto, user: UserEntity) {
        const queryMemberOfODC = createQueryBuilder(ProjectInviteMember, 'Project_Member')
            .innerJoin(ProjectEntity, 'Project', 'Project_Member.project_id = Project.id')
            .where('Project.type = :type', { type: ProjectType.ODC });

        const queryMemberOfPB = createQueryBuilder(ProjectInviteMember, 'Project_Member')
            .innerJoin(ProjectEntity, 'Project', 'Project_Member.project_id = Project.id')
            .where('Project.type = :type', { type: ProjectType.PB });

        const querySumOfODC = createQueryBuilder(ProjectEntity, 'Project')
            .select('SUM(Project.costs)', '')
            .where('Project.type = :type', { type: ProjectType.ODC });

        const querySumOfPB = createQueryBuilder(ProjectEntity, 'Project')
            .select('SUM(Project.costs)', '')
            .where('Project.type = :type', { type: ProjectType.PB })

        const [inProgressProject, doneProject, cancelledProject, memberOfODC, memberOfPB, sumOfODC, sumOfPB] = await Promise.all([
            this.projectRepository.count({ status: ProjectStatus.IN_PROGRESS }),
            this.projectRepository.count({ status: ProjectStatus.DONE }),
            this.projectRepository.count({ status: ProjectStatus.CANCELLED }),
            queryMemberOfODC.getCount(),
            queryMemberOfPB.getCount(),
            querySumOfODC.getRawOne(),
            querySumOfPB.getRawOne()
        ])

        const { numOfMember, totalMember } = createProjectReportDto;

        const percent = numOfMember / totalMember * 100;

        const AVGODC = sumOfODC.sum - (memberOfODC * 50) - (sumOfODC.sum / 50);

        const AVGPB = sumOfPB.sum - (memberOfPB * 50) - (sumOfPB.sum / 60);

        const report = this.projectReportRepository.create({
            InProgress: inProgressProject,
            Done: doneProject,
            Cancelled: cancelledProject,
            PercentMemOfProject: percent,
            AVGCostOfODCProject: AVGODC,
            AVGCostOfPBProject: AVGPB,
            user
        })

        await this.projectReportRepository.save(report);

        return apiResponse(HttpStatus.OK, 'Create Report successful', {})
    }

    async getProjectReport() {
        return this.projectReportRepository.find();
    }

    async getProjectReportById(id: string): Promise<ProjectReportEntity> {
        const found = await this.projectReportRepository.findOne(id);

        if (!found) {
            throw new NotFoundException(`Project with ID: ${id} is not found`);
        }

        return found;
    }

    async deleteProjectReport(id: string) {
        const result = await this.projectReportRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Task with Id: ${id} is not found`);
        }

        return apiResponse(HttpStatus.OK, 'Delete successful.', {});
    }

    async exportProjectReport(projectReportID: string) {
        const projectReport = await this.projectReportRepository.findOne(projectReportID);

        let book = new Workbook();

        let sheet = book.addWorksheet('sheet1')

        sheet.columns = [
            { header: 'ID', key: 'id', width: 50 },
            { header: 'InProgress', key: 'inprogress', width: 10 },
            { header: 'Done', key: 'done', width: 10 },
            { header: 'Cancelled', key: 'cancelled', width: 10 },
            { header: 'AVGCost Of ODC Project', key: 'avgcostofodcproject', width: 50 },
            { header: 'AVGCost Of PB Project', key: 'avgcostofpbproject', width: 50 },
            { header: 'PercentMemOfProject', key: 'percentmemofproject', width: 10 },
            { header: 'Created by', key: 'createdby', width: 30 }
        ]
        sheet.addRow({
            id: projectReport.id,
            inprogress: projectReport.InProgress,
            done: projectReport.Done,
            cancelled: projectReport.Cancelled,
            avgcostofodcproject: projectReport.AVGCostOfODCProject,
            avgcostofpbproject: projectReport.AVGCostOfPBProject,
            percentmemofproject: projectReport.PercentMemOfProject,
            createdby: projectReport.user.name
        });

        let File = await new Promise((resolve, reject) => {
            tmp.file({ discardDescriptor: true, prefix: `ReportSheet`, postfix: '.xlsx', mode: parseInt('0600', 8) }, async (err, file) => {
                if (err)
                    throw new BadRequestException(err);

                book.xlsx.writeFile(file).then(_ => {
                    resolve(file)
                }).catch(err => {
                    throw new BadRequestException(err)
                })
            })
        })
        return File;
    }

    //Task Report
    async createReportForTask(createTaskReportDto: CreateTaskReportDto) {
        const { project_id } = createTaskReportDto;
        const findProject = await this.projectRepository.findOne(project_id);

        const findProjectInTask = await this.taskRepository.findOne({ project_id: findProject });

        if (findProjectInTask) {
            const queryInProgressTask = createQueryBuilder(TaskEntity, 'Task')
                .innerJoin(ProjectEntity, 'Project', 'Task.project_id = Project.id')
                .where('Task.status = :status', { status: ProjectStatus.IN_PROGRESS });

            const queryDoneTask = createQueryBuilder(TaskEntity, 'Task')
                .innerJoin(ProjectEntity, 'Project', 'Task.project_id = Project.id')
                .where('Task.status = :status', { status: ProjectStatus.DONE });

            const queryBugTask = createQueryBuilder(TaskEntity, 'Task')
                .innerJoin(ProjectEntity, 'Project', 'Task.project_id = Project.id')
                .where('Task.status = :status', { status: ProjectStatus.BUG });

            const [inProgressTask, doneTask, bugTask, numOfTask] = await Promise.all([
                queryInProgressTask.getCount(),
                queryDoneTask.getCount(),
                queryBugTask.getCount(),
                this.taskRepository.count()
            ])

            const percent = bugTask / numOfTask * 100;

            const taskReport = this.taskReportRepository.create({
                InProgress: inProgressTask,
                Done: doneTask,
                Bug: bugTask,
                PercentOfBug: percent
            });

            await this.taskReportRepository.save(taskReport);

            return apiResponse(HttpStatus.CREATED, 'Create Task Report Succcessful', { taskReport })
        } else {
            throw new NotFoundException('No project found!');
        }
    }

    async getTaskReport() {
        return this.taskReportRepository.find();
    }

    async getTaskReportById(id: string): Promise<TaskReportEntity> {
        const found = await this.taskReportRepository.findOne(id);

        if (!found) {
            throw new NotFoundException(`Project with ID: ${id} is not found`);
        }

        return found;
    }

    async deleteTaskReport(id: string) {
        const result = await this.taskReportRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Task with Id: ${id} is not found`);
        }

        return apiResponse(HttpStatus.OK, 'Delete successful.', {});
    }

    async exportTaskReport(taskReportID: string) {
        const taskReport = await this.taskReportRepository.findOne(taskReportID);

        let book = new Workbook();

        let sheet = book.addWorksheet('sheet1')

        sheet.columns = [
            { header: 'ID', key: 'id', width: 50 },
            { header: 'InProgress', key: 'inprogress', width: 10 },
            { header: 'Done', key: 'done', width: 10 },
            { header: 'Bug', key: 'bug', width: 10 },
            { header: 'PercentOfBug', key: 'percentofbug', width: 30 },
        ]

        sheet.addRow({
            id: taskReport.id,
            inprogress: taskReport.InProgress,
            done: taskReport.Done,
            bug: taskReport.Bug,
            percentofbug: taskReport.PercentOfBug
        });

        let File = await new Promise((resolve, reject) => {
            tmp.file({ discardDescriptor: true, prefix: `ReportSheet`, postfix: '.xlsx', mode: parseInt('0600', 8) }, async (err, file) => {
                if (err)
                    throw new BadRequestException(err);

                book.xlsx.writeFile(file).then(_ => {
                    resolve(file)
                }).catch(err => {
                    throw new BadRequestException(err)
                })
            })
        })
        return File;
    }
}
