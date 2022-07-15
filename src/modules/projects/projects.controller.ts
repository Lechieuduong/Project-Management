import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Roles } from 'src/auth/decorators/role.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserEntity } from '../users/entity/user.entity';
import { UsersRole } from '../users/users.constants';
import { ChangeProjectStatusDto } from './dto/change-project-status.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectEntity } from './entity/project.entity';
import { ProjectsService } from './projects.service';

@ApiTags('Project')
@ApiBearerAuth()
@Controller('projects')
@UseGuards(AuthGuard(), RolesGuard)
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    @Post('/create_project')
    @Roles(UsersRole.ADMIN, UsersRole.SUPERADMIN)
    createProject(
        @Body() createProjectDto: CreateProjectDto,
        @GetUser() user: UserEntity
    ) {
        return this.projectsService.createProject(createProjectDto, user)
    }

    @Get('/get_all_projects')
    getAllProjects() {
        return this.projectsService.getAllProjects();
    }

    @Get('/get_one_project/:id')
    getProjectById(@Param('id') id: string): Promise<ProjectEntity> {
        return this.projectsService.getProjectById(id);
    }

    @Patch('/update_project/:id')
    @UseGuards(RolesGuard)
    @ApiBearerAuth()
    @Roles(UsersRole.ADMIN, UsersRole.SUPERADMIN)
    updateProject(
        @Body() updateProjectDto: UpdateProjectDto,
        @Param('id') id: string
    ) {
        return this.projectsService.updateProject(id, updateProjectDto);
    }

    @Patch('/change_status_project/:id')
    @UseGuards(AuthGuard(), RolesGuard)
    @ApiBearerAuth()
    @Roles(UsersRole.ADMIN, UsersRole.SUPERADMIN)
    changeStatusProject(
        @Body() changeStatusProjectDto: ChangeProjectStatusDto,
        @Param('id') id: string
    ) {
        return this.projectsService.changeProjectStatus(changeStatusProjectDto, id)
    }

    @Delete('delete_project/:id')
    @UseGuards(AuthGuard(), RolesGuard)
    @ApiBearerAuth()
    @Roles(UsersRole.ADMIN, UsersRole.SUPERADMIN)
    deleteProject(
        @Param('id') id: string
    ) {
        return this.projectsService.deleteProject(id);
    }

    @Post('/add_member_into_project/:user_id&:project_id')
    @UseGuards(AuthGuard(), RolesGuard)
    @ApiBearerAuth()
    @Roles(UsersRole.ADMIN, UsersRole.SUPERADMIN)
    addMembersToProject(
        @Param('user_id') user_id: string,
        @Param('project_id') project_id: string
    ) {
        return this.projectsService.addMembersToProject(user_id, project_id)
    }

    @Get('/get_project_infor')
    getProjectInfor(
        @GetUser() user: UserEntity
    ) {
        return this.projectsService.getProjectInfor(user);
    }


    @Delete('kick_user_from_project/:user_id')
    @UseGuards(AuthGuard(), RolesGuard)
    @ApiBearerAuth()
    @Roles(UsersRole.ADMIN, UsersRole.SUPERADMIN)
    kickUserFromProject(
        @Param('user_id') user_id: string
    ) {
        return this.projectsService.kickUserFromProject(user_id);
    }
}
