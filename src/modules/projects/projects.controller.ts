import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Roles } from 'src/auth/decorators/role.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserEntity } from '../users/entity/user.entity';
import { UsersRole } from '../users/users.constants';
import { AddMemberDto } from './dto/add-member.dto';
import { ChangeProjectStatusDto } from './dto/change-project-status.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectEntity } from './entity/project.entity';
import { ProjectsService } from './projects.service';

@ApiTags('Project')
@Controller('projects')
@UseGuards(AuthGuard())
@ApiBearerAuth()
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    @Post('/create_project/admin')
    //@Roles(UsersRole.ADMIN, UsersRole.SUPERADMIN)
    createProject(
        @Body() createProjectDto: CreateProjectDto,
        @GetUser() user: UserEntity
    ) {
        return this.projectsService.createProject(createProjectDto, user)
    }

    @Get('/get_all_project')
    getAllProjects() {
        return this.projectsService.getAllProjects();
    }

    @Get('/get_one_project/:id')
    getProjectById(@Param('id') id: string): Promise<ProjectEntity> {
        return this.projectsService.getProjectById(id);
    }

    @Patch('/update_project/admin/:id')
    //@Roles(UsersRole.ADMIN, UsersRole.SUPERADMIN)
    updateProject(
        @Body() updateProjectDto: UpdateProjectDto,
        @Param('id') id: string
    ) {
        return this.projectsService.updateProject(id, updateProjectDto);
    }

    @Patch('/change_status_projecy/:id')
    //@Roles(UsersRole.ADMIN, UsersRole.SUPERADMIN)
    changeStatusProject(
        @Body() changeStatusProjectDto: ChangeProjectStatusDto,
        @Param('id') id: string
    ) {
        return this.projectsService.changeProjectStatus(changeStatusProjectDto, id)
    }

    @Delete('delete_project/:id')
    //@Roles(UsersRole.ADMIN, UsersRole.SUPERADMIN)
    deleteProject(
        @Param('id') id: string
    ) {
        return this.projectsService.deleteProject(id);
    }

    @Post('/add_member_into_project/:id')
    //@Roles(UsersRole.ADMIN, UsersRole.SUPERADMIN)
    addMembers(
        @Body() addMemberDto: AddMemberDto,
        @Param('id') id: string
    ) {
        return this.projectsService.addMembers(addMemberDto, id)
    }
}
