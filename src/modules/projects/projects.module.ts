import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsRepository } from './projects.repository';
import { ProjectEntity } from './entity/project.entity';
import { PassportModule } from '@nestjs/passport';
import { ProjectInviteMember } from './entity/project-invite-member.entity';
import { UsersRepository } from '../users/users.repository';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from 'src/auth/guards/roles.guard';

const passportModule = PassportModule.register({ defaultStrategy: 'jwt' });

@Module({
  imports: [
    passportModule,
    TypeOrmModule.forFeature([ProjectsRepository, ProjectEntity, ProjectInviteMember, UsersRepository])
  ],
  providers: [ProjectsService, RolesGuard],
  controllers: [ProjectsController],
  exports: [ProjectsService],
})
export class ProjectsModule { }
