import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { apiResponse } from 'src/common/api-response/apiresponse';
import { Repository } from 'typeorm';
import { ProjectInviteMember } from '../projects/entity/project-invite-member.entity';
import { ProjectStatus } from '../projects/projects.constants';
import { ProjectsRepository } from '../projects/projects.repository';
import { TasksRepository } from '../tasks/tasks.repository';
import { CreateProjectReportDto } from './dto/create-report.dto';
import { ProjectReportRepository } from './repository/report.repository';
import { TaskReportRepository } from './repository/task-report.repository';

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
        //const findProject = await this.projectRepository.findOne(project_id);

        const inProgressProject = await this.projectRepository.count({ status: ProjectStatus.IN_PROGRESS });

        const doneProject = await this.projectRepository.count({ status: ProjectStatus.DONE });

        const cancelledProject = await this.projectRepository.count({ status: ProjectStatus.CANCELLED })

        const { numOfMember, totalMember } = createProjectReportDto;

        const percent = numOfMember / totalMember * 100

        const report = this.projectReportRepository.create({
            InProgress: inProgressProject,
            Done: doneProject,
            Cancelled: cancelledProject,
            PercentMemOfProject: percent
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


    // async downloadExcel() {
    //     if (!data) {
    //         throw new NotFoundException('No data download.')
    //     }

    //     let rows = [];

    //     data.forEach(doc => {
    //         rows.push(Object.values(doc))
    //     })

    //     let book = new Workbook();

    //     let sheet = book.addWorksheet('sheet1');

    //     rows.unshift(Object.keys(data[0]))

    //     sheet.addRows(rows);

    //     let File = await new Promise((resolve, reject) => {
    //         tmp.file({ discardDescriptor: true, prefix: 'MyExcelSheet', postfix: '.xlsx', mode: parseInt('0600', 8) }, async (err, file) => {
    //             if (err)
    //                 throw new BadRequestException(err);

    //             book.xlsx.writeFile(file).then(_ => {
    //                 resolve(file)
    //             }).catch(err => {
    //                 throw new BadRequestException(err)
    //             })
    //         })
    //     })

    //     return File;
    // }
}
