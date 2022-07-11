import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsRepository } from '../projects/projects.repository';
import { ProjectInviteMember } from '../projects/entity/project-invite-member.entity';
import { ReportsRepository } from './report.repository';
import { ReportEntity } from './entity/report.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProjectsRepository, ProjectInviteMember, ReportsRepository, ReportEntity])
  ],
  providers: [ReportService],
  controllers: [ReportController]
})
export class ReportModule { }
