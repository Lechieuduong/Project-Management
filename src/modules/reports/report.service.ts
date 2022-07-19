import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Workbook } from 'exceljs';
import { apiResponse } from 'src/common/api-response/apiresponse';
import { createQueryBuilder, Repository, SelectQueryBuilder } from 'typeorm';
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

    async createReportForProject(createProjectReportDto: CreateProjectReportDto, user: UserEntity) {

        const inProgressProject = await this.projectRepository.count({ status: ProjectStatus.IN_PROGRESS });

        const doneProject = await this.projectRepository.count({ status: ProjectStatus.DONE });

        const cancelledProject = await this.projectRepository.count({ status: ProjectStatus.CANCELLED })

        const { numOfMember, totalMember } = createProjectReportDto;

        const percent = numOfMember / totalMember * 100;

        const memberOfODC = await createQueryBuilder(ProjectInviteMember, 'Project_Member')
            .innerJoin(ProjectEntity, 'Project', 'Project_Member.project_id = Project.id')
            .where('Project.type = :type', { type: ProjectType.ODC }).getCount();

        const memberOfPB = await createQueryBuilder(ProjectInviteMember, 'Project_Member')
            .innerJoin(ProjectEntity, 'Project', 'Project_Member.project_id = Project.id')
            .where('Project.type = :type', { type: ProjectType.PB }).getCount();

        const sumOfODC = await createQueryBuilder(ProjectEntity, 'Project')
            .select('SUM(Project.costs)', '')
            .where('Project.type = :type', { type: ProjectType.ODC }).getRawOne()

        const sumOfPB = await createQueryBuilder(ProjectEntity, 'Project')
            .select('SUM(Project.costs)', '')
            .where('Project.type = :type', { type: ProjectType.PB }).getRawOne()


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

    async createReportForTask(project_id: string) {

        const findProject = await this.projectRepository.findOne(project_id);

        const findProjectInTask = await this.taskRepository.findOne({ project_id: findProject });

        if (findProjectInTask) {

            const inProgressTask = await createQueryBuilder(TaskEntity, 'Task')
                .innerJoin(ProjectEntity, 'Project', 'Task.project_id = Project.id')
                .where('Task.status = :status', { status: ProjectStatus.IN_PROGRESS }).getCount();

            const doneTask = await createQueryBuilder(TaskEntity, 'Task')
                .innerJoin(ProjectEntity, 'Project', 'Task.project_id = Project.id')
                .where('Task.status = :status', { status: ProjectStatus.DONE }).getCount();

            const bugTask = await createQueryBuilder(TaskEntity, 'Task')
                .innerJoin(ProjectEntity, 'Project', 'Task.project_id = Project.id')
                .where('Task.status = :status', { status: ProjectStatus.BUG }).getCount();


            const numOfTask = await this.taskRepository.count();

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
        sheet.addRow({ id: projectReport.id, inprogress: projectReport.InProgress, done: projectReport.Done, cancelled: projectReport.Cancelled, avgcostofodcproject: projectReport.AVGCostOfODCProject, avgcostofpbproject: projectReport.AVGCostOfPBProject, percentmemofproject: projectReport.PercentMemOfProject, createdby: projectReport.user.name });

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

        sheet.addRow({ id: taskReport.id, inprogress: taskReport.InProgress, done: taskReport.Done, bug: taskReport.Bug, percentofbug: taskReport.PercentOfBug });

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
