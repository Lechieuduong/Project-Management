import { ConflictException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { apiResponse } from 'src/common/api-response/apiresponse';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/entity/user.entity';
import { AddMemberDto } from './dto/add-member.dto';
import { ChangeProjectStatusDto } from './dto/change-project-status.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectEntity } from './entity/project.entity';
import { ProjectsRepository } from './projects.repository';

@Injectable()
export class ProjectsService {
    constructor(
        @InjectRepository(ProjectsRepository)
        private readonly projectsRepository: ProjectsRepository
    ) { }

    async createProject(
        createProjectDto: CreateProjectDto,
        user: UserEntity
    ) {
        return this.projectsRepository.createProject(createProjectDto, user);
    }

    async getAllProjects() {
        return this.projectsRepository.getAllProjects();
    }

    async getProjectById(id: string): Promise<ProjectEntity> {
        const found = await this.projectsRepository.findOne(id);

        if (!found) {
            throw new NotFoundException(`Task with ID: ${id} is not found`);
        }

        return found;
    }

    async updateProject(
        id: string,
        updateProjectDto: UpdateProjectDto,
    ) {
        const checkProject = await this.projectsRepository.findOne(id);

        if (!checkProject)
            throw new NotFoundException(`Project with Id: ${id} is not found.`);

        const { projectName, projectCode, startDate, endDate, costs } = updateProjectDto;

        checkProject.projectName = projectName;

        checkProject.projectCode = projectCode;

        checkProject.startDate = startDate;

        checkProject.endDate = endDate;

        checkProject.costs = costs;

        await this.projectsRepository.save(checkProject);

        return apiResponse(HttpStatus.OK, 'Update project successfully', {});
    }

    async changeProjectStatus(
        changeProjectStatusDto: ChangeProjectStatusDto,
        id: string,
    ) {
        const { status } = changeProjectStatusDto
        const checkProject = await this.projectsRepository.findOne(id);

        if (!checkProject)
            throw new NotFoundException(`Project with Id: ${id} is not found.`);

        checkProject.status = status;

        await this.projectsRepository.save(checkProject);

        return apiResponse(HttpStatus.OK, 'Change status successfully', {});
    }

    async deleteProject(id: string) {
        const result = await this.projectsRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Task with ID: ${id} is not found`);
        }

        return apiResponse(HttpStatus.OK, 'Delete successful', {});
    }

    async addMembers(addMembersDto: AddMemberDto, id: string) {
        const { email, role } = addMembersDto;
        try {
            const project = await this.projectsRepository.findOne(id);
            const newArr = project.members || [];
            newArr.push({ email, role });
            project.members = newArr;
            project.save();

            return apiResponse(HttpStatus.OK, 'Add members successful', {})
        } catch (error) {
            if (error.code === '23505') {
                throw new ConflictException(
                    `This member already exists.`,
                );
            }

            throw new InternalServerErrorException();

        }
    }
}
