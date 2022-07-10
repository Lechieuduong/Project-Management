import { BadRequestException, ConflictException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { apiResponse } from 'src/common/api-response/apiresponse';
import { createQueryBuilder, getRepository, Repository } from 'typeorm';
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
        const newProject = await this.projectsRepository.createProject(createProjectDto, user);

        await this.addMembersToProject(user.id, newProject.id)

        return apiResponse(HttpStatus.CREATED, 'Create project successful', { newProject })
    }

    async getAllProjects(user: UserEntity) {
        // const projectQuery = createQueryBuilder(ProjectEntity, 'Project')
        //     .leftJoinAndSelect('Project.members_id', 'Project_Member')
        //     .leftJoinAndSelect('Project_Member.user_id', 'User')
        //     .where('User.id = :id', { id: user.id })


        // return await projectQuery.getMany();
        return this.projectsRepository.find();
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
        const findUser = await this.userRepository.findOne(user_id);
        const findProject = await this.projectsRepository.findOne(project_id);

        const checkExist = await this.projectInviteMember.findOne({ user_id: findUser, project_id: findProject })

        if (checkExist) {
            throw new BadRequestException('This member already exists.')
        }
        const inviteUser = this.projectInviteMember.create({
            user_id: findUser,
            project_id: findProject
        })

        this.projectInviteMember.save(inviteUser);

        findProject.members_id.push(inviteUser);

        return apiResponse(HttpStatus.OK, 'Add members successful', {});
    }

    async getProjectInfor(user: UserEntity) {
        const projectQuery = createQueryBuilder(ProjectEntity, 'Project')
            .leftJoinAndSelect('Project.members_id', 'Project_Member')
            .leftJoinAndSelect('Project_Member.user_id', 'User')
            .leftJoinAndSelect('Project.tasks_id', 'Task')
            .where('User.id = :id', { id: user.id })


        return await projectQuery.getMany();
    }

    // async kickUserFromProject(id: string) {
    //     const kickUserQuery = createQueryBuilder()
    //         .delete()
    //         .from(ProjectEntity, 'Project')
    //         .from(ProjectInviteMember, 'Project_Member')
    //         .where('Project.members_id = Project_Member.user_id')
    //         .andWhere('Project.members_id = :id', { id: id })
    //         .execute()

    //     return apiResponse(HttpStatus.OK, 'Kick member successful', { kickUserQuery });
    // }

    /**
    * SELECT "Project".* FROM "Project",
    "Project Member", "User" where
    "Project".id = "projectIdId" and
    "userIdId" = "User".id
     */
}
