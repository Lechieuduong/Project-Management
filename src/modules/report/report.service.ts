import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { apiResponse } from 'src/common/api-response/apiresponse';
import { Repository } from 'typeorm';
import { ProjectInviteMember } from '../projects/entity/project-invite-member.entity';
import { ProjectStatus } from '../projects/projects.constants';
import { ProjectsRepository } from '../projects/projects.repository';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportsRepository } from './report.repository';

@Injectable()
export class ReportService {
    constructor(
        @InjectRepository(ReportsRepository)
        private readonly reportRepository: ReportsRepository,

        @InjectRepository(ProjectsRepository)
        private readonly projectRepository: ProjectsRepository,

        @InjectRepository(ProjectInviteMember)
        private readonly projectInviteMember: Repository<ProjectInviteMember>,

    ) { }

    async createReport(createReportDto: CreateReportDto) {
        //const findProject = await this.projectRepository.findOne(project_id);

        const inProgressProject = await this.projectRepository.count({ status: ProjectStatus.IN_PROGRESS });

        const doneProject = await this.projectRepository.count({ status: ProjectStatus.DONE });

        const cancelledProject = await this.projectRepository.count({ status: ProjectStatus.CANCELLED })

        const { numOfMember, totalMember } = createReportDto;

        const percent = numOfMember / totalMember * 100

        const report = this.reportRepository.create({
            InProgress: inProgressProject,
            Done: doneProject,
            Cancelled: cancelledProject,
            PercentMemOfProject: percent
        })

        await this.reportRepository.save(report);

        return apiResponse(HttpStatus.OK, 'Create Report successful', { report })
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
