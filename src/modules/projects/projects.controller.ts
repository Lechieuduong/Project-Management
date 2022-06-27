import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { userInfo } from 'os';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { UserEntity } from '../users/entity/user.entity';
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

    @Post('/create_project')
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

    @Patch('/update_project/:id')
    updateProject(
        @Body() updateProjectDto: UpdateProjectDto,
        @Param('id') id: string
    ) {
        return this.projectsService.updateProject(id, updateProjectDto);
    }

    @Patch('/change_status_projecy/:id')
    changeStatusProject(
        @Body() changeStatusProjectDto: ChangeProjectStatusDto,
        @Param('id') id: string
    ) {
        return this.projectsService.changeProjectStatus(changeStatusProjectDto, id)
    }

    @Delete('delete_project/:id')
    deleteProject(
        @Param('id') id: string
    ) {
        return this.projectsService.deleteProject(id);
    }
}
