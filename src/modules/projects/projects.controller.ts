import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ChangeProjectStatusDto } from './dto/change-project-status.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectEntity } from './entity/project.entity';
import { ProjectsService } from './projects.service';

@ApiTags('Project')
@Controller('projects')
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    @Post('/create_project')
    createProject(
        @Body() createProjectDto: CreateProjectDto
    ) {
        return this.projectsService.createProject(createProjectDto)
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
