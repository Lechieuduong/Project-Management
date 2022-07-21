import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskEntity } from './entity/task.entity';
import { ProjectInviteMember } from '../projects/entity/project-invite-member.entity';
import { UsersRepository } from '../users/users.repository';
import { PassportModule } from '@nestjs/passport';
import { ProjectsRepository } from '../projects/projects.repository';
import { TasksRepository } from './tasks.repository';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { ProjectsService } from '../projects/projects.service';

const passportModule = PassportModule.register({ defaultStrategy: 'jwt' });

@Module({
  imports: [
    passportModule,
    TypeOrmModule.forFeature([
      TaskEntity,
      UsersRepository,
      ProjectInviteMember,
      ProjectsRepository,
      TasksRepository
    ])
  ],
  providers: [TasksService, RolesGuard],
  controllers: [TasksController],
  exports: [TasksService]
})
export class TasksModule { }
