import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskEntity } from './entity/task.entity';
import { ProjectInviteMember } from '../projects/entity/project-invite-member.entity';
import { UsersRepository } from '../users/users.repository';
import { PassportModule } from '@nestjs/passport';

const passportModule = PassportModule.register({ defaultStrategy: 'jwt' });

@Module({
  imports: [
    passportModule,
    TypeOrmModule.forFeature([TaskEntity, UsersRepository, ProjectInviteMember])
  ],
  providers: [TasksService],
  controllers: [TasksController],
  exports: [TasksService]
})
export class TasksModule { }
