import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsRepository } from '../projects/projects.repository';
import { ProjectInviteMember } from '../projects/entity/project-invite-member.entity';
import { ProjectReportRepository } from './repository/report.repository';
import { ProjectReportEntity } from './entities/report.entity';
import { TasksRepository } from '../tasks/tasks.repository';
import { TaskReportEntity } from './entities/task-report';
import { TaskReportRepository } from './repository/task-report.repository';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { PassportModule } from '@nestjs/passport';

const passportModule = PassportModule.register({ defaultStrategy: 'jwt' });

@Module({
  imports: [
    passportModule,
    TypeOrmModule.forFeature([
      ProjectsRepository,
      ProjectInviteMember,
      ProjectReportEntity,
      ProjectReportRepository,
      TasksRepository,
      TaskReportEntity,
      TaskReportRepository,
    ])
  ],
  providers: [ReportService, RolesGuard],
  controllers: [ReportController]
})
export class ReportModule { }
