import { ConflictException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { apiResponse } from 'src/common/api-response/apiresponse';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/entity/user.entity';
import { UsersRepository } from '../users/users.repository';
import { ChangeProjectStatusDto } from './dto/change-project-status.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectInviteMember } from './entity/project-invite-member.entity';
import { ProjectEntity } from './entity/project.entity';
import { ProjectsRepository } from './projects.repository';

@Injectable()
export class ProjectsService {
    constructor(
        @InjectRepository(ProjectsRepository)
        private readonly projectsRepository: ProjectsRepository,
        @InjectRepository(ProjectInviteMember)
        private projectInviteMember: Repository<ProjectInviteMember>,
        @InjectRepository(UsersRepository)
        private readonly userRepository: UsersRepository,
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
            throw new NotFoundException(`Project with ID: ${id} is not found`);
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

    async addMembersToProject(user_id: string, project_id: string) {
        try {
            const findUser = await this.userRepository.findOne(user_id);
            const findProject = await this.projectsRepository.findOne(project_id)

            const inviteUser = this.projectInviteMember.create({
                user_id: findUser,
                project_id: findProject
            })

            this.projectInviteMember.save(inviteUser);

            findProject.members_id.push(inviteUser);

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
