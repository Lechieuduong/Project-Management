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

const passportModule = PassportModule.register({ defaultStrategy: 'jwt' });

@Module({
  imports: [
    passportModule,
    TypeOrmModule.forFeature([TaskEntity, UsersRepository, ProjectInviteMember, ProjectsRepository, TasksRepository])
  ],
  providers: [TasksService],
  controllers: [TasksController],
  exports: [TasksService]
})
export class TasksModule { }
