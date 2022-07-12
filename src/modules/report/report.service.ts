import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Workbook } from 'exceljs';
import { apiResponse } from 'src/common/api-response/apiresponse';
import { Repository } from 'typeorm';
import { ProjectInviteMember } from '../projects/entity/project-invite-member.entity';
import { ProjectStatus } from '../projects/projects.constants';
import { ProjectsRepository } from '../projects/projects.repository';
import { TasksRepository } from '../tasks/tasks.repository';
import { CreateProjectReportDto } from './dto/create-report.dto';
import { ProjectReportEntity } from './entities/report.entity';
import { ProjectReportRepository } from './repository/report.repository';
import { TaskReportRepository } from './repository/task-report.repository';
import * as tmp from 'tmp';


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

    async createReportForProject(createProjectReportDto: CreateProjectReportDto) {

        const inProgressProject = await this.projectRepository.count({ status: ProjectStatus.IN_PROGRESS });

        const doneProject = await this.projectRepository.count({ status: ProjectStatus.DONE });

        const cancelledProject = await this.projectRepository.count({ status: ProjectStatus.CANCELLED })

        const { numOfMember, totalMember } = createProjectReportDto;

        const percent = numOfMember / totalMember * 100

        const report = this.projectReportRepository.create({
            InProgress: inProgressProject,
            Done: doneProject,
            Cancelled: cancelledProject,
            PercentMemOfProject: percent,
            AVGCost: 0
        })

        await this.projectReportRepository.save(report);

        return apiResponse(HttpStatus.OK, 'Create Report successful', { report })
    }

    async createReportForTask(project_id: string) {
        const findProject = await this.projectRepository.findOne(project_id);

        const findProjectInTask = await this.taskRepository.findOne({ project_id: findProject });

        if (findProjectInTask) {
            const inProgressTask = await this.taskRepository.count({ status: ProjectStatus.IN_PROGRESS });

            const doneTask = await this.taskRepository.count({ status: ProjectStatus.DONE });

            const bugTask = await this.taskRepository.count({ status: ProjectStatus.BUG });

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

    async downloadExcel(projectReportID: string) {
        const projectReport = await this.projectReportRepository.findOne(projectReportID);
        // const data = [];
        // data.push(projectReport.id, projectReport.InProgress, projectReport.Done, projectReport.Cancelled, projectReport.PercentMemOfProject)

        // const rows = [];

        // //rows.push(projectReport.id.toString, projectReport.InProgress, projectReport.Done, projectReport.Cancelled, projectReport.PercentMemOfProject);

        // data.forEach(doc => {
        //     rows.push(Object.values(doc))
        // }) http://localhost:9000/report/download/54578629-2e92-4a80-8fe8-2c380bf2800f

        let book = new Workbook();

        let sheet = book.addWorksheet('sheet1')

        // rows.unshift(Object.keys(data[2]));
        sheet.columns = [
            { header: 'Id', key: 'id', width: 50 },
            { header: 'InProgress', key: 'inprogress', width: 10 },
            { header: 'Done', key: 'done', width: 10 },
            { header: 'Cancelled', key: 'cancelled', width: 10 },
            { header: 'AVGCost', key: 'avgcost', width: 10 },
            { header: 'PercentMemOfProject', key: 'percentmemofproject', width: 10 },
        ]
        sheet.addRow({ id: projectReport.id, inprogress: projectReport.InProgress, done: projectReport.Done, cancelled: projectReport.Cancelled, avgcost: projectReport.AVGCost, percentmemofproject: projectReport.PercentMemOfProject });

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
