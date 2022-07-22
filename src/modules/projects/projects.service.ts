import {
    BadRequestException,
    HttpStatus,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { apiResponse } from 'src/common/api-response/apiresponse';
import { CommonError, CommonSuccess } from 'src/common/constants/common.constants';
import { Connection, createQueryBuilder, getConnection, Repository } from 'typeorm';
import { UserEntity } from '../users/entity/user.entity';
import { UsersRepository } from '../users/users.repository';
import { AddAndKickMemberDto } from './dto/addandkick-member.dto';
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

        await this.addMembersToProject({ user_id: user.id, project_id: newProject.id })

        delete newProject.user.project;
        delete newProject.user.created_at;
        delete newProject.user.inviteUSer_id;
        delete newProject.user.password;
        delete newProject.user.verified;
        delete newProject.user.verify_code;
        delete newProject.user.task_id;
        delete newProject.user.report;
        delete newProject.user.updated_at;

        return apiResponse(HttpStatus.CREATED, CommonSuccess.CREATED_PROJECT_SUCCESS, { newProject })
    }

    async getAllProjects() {
        return this.projectsRepository.find();
    }

    async getProjectById(id: string): Promise<ProjectEntity> {
        const found = await this.projectsRepository.findOne(id);

        if (!found) {
            throw new NotFoundException(CommonError.NOT_FOUND_PROJECT);
        }

        return found;
    }

    async updateProject(
        id: string,
        updateProjectDto: UpdateProjectDto,
    ) {
        const checkProject = await this.projectsRepository.findOne(id);

        if (!checkProject)
            throw new NotFoundException(CommonError.NOT_FOUND_PROJECT);

        const { projectName, projectCode, startDate, endDate, costs, type } = updateProjectDto;

        checkProject.projectName = projectName;

        checkProject.projectCode = projectCode;

        checkProject.startDate = startDate;

        checkProject.endDate = endDate;

        checkProject.costs = costs;

        checkProject.type = type;

        await this.projectsRepository.save(checkProject);

        return apiResponse(HttpStatus.OK, CommonSuccess.UPDATED_PROJECT_SUCCESS, {});
    }

    async changeProjectStatus(
        changeProjectStatusDto: ChangeProjectStatusDto,
        id: string,
    ) {
        const { status } = changeProjectStatusDto
        const checkProject = await this.projectsRepository.findOne(id);

        if (!checkProject)
            throw new NotFoundException(CommonError.NOT_FOUND_PROJECT);

        checkProject.status = status;

        await this.projectsRepository.save(checkProject);

        return apiResponse(HttpStatus.OK, CommonSuccess.CHANGE_STATUS_PROJECT, {});
    }

    async deleteProject(id: string) {
        const result = await this.projectsRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(CommonError.NOT_FOUND_PROJECT);
        }

        return apiResponse(HttpStatus.OK, CommonSuccess.DELETE_PROJECT_SUCCESS, {});
    }

    async addMembersToProject(addAndKickMemberDtoDto: AddAndKickMemberDto) {
        const { user_id, project_id } = addAndKickMemberDtoDto
        const [findUser, findProject] = await Promise.all([
            this.userRepository.findOne(user_id),
            this.projectsRepository.findOne(project_id),
        ])
        const checkExist = await this.projectInviteMember.findOne({ user_id: findUser, project_id: findProject })

        if (checkExist) {
            throw new BadRequestException(CommonError.EXISTS_MEMBER)
        }
        const inviteUser = this.projectInviteMember.create({
            user_id: findUser,
            project_id: findProject
        })

        await this.projectInviteMember.save(inviteUser);

        findProject.members_id.push(inviteUser);

        return apiResponse(HttpStatus.OK, CommonSuccess.ADD_MEMBERS, {});
    }

    async kickUserFromProject(addAndKickMemberDtoDto: AddAndKickMemberDto) {
        const { user_id, project_id } = addAndKickMemberDtoDto
        const [findUser, findProject] = await Promise.all([
            this.userRepository.findOne(user_id),
            this.projectsRepository.findOne(project_id),
        ])

        const checkExist = await this.projectInviteMember.findOne({ user_id: findUser, project_id: findProject })

        if (!checkExist) {
            throw new BadRequestException(CommonError.NOT_EXISTS_MEMBER);
        }

        this.projectInviteMember.delete(checkExist);

        return apiResponse(HttpStatus.OK, CommonSuccess.KICK_MEMBERS, {});
    }

    async getProjectInfor(user: UserEntity) {
        const projectQuery = await createQueryBuilder(ProjectEntity, 'Project')
            .leftJoinAndSelect('Project.members_id', 'Project_Member')
            .leftJoin('Project_Member.user_id', 'User')
            .leftJoinAndSelect('Project.tasks_id', 'Task')
            .where('User.id = :id', { id: user.id }).getMany();
        delete user.password;

        return apiResponse(HttpStatus.OK, CommonSuccess.GET_INFORMATION, projectQuery)
    }

    async getAllMembersInProject(project_id: string) {
        const memberQuery = await createQueryBuilder(ProjectInviteMember, 'project_members')
            .leftJoin('project_members.project_id', 'projects')
            .leftJoinAndSelect('project_members.user_id', 'users')
            .select(['users.id, users.name, users.email, users.avatar, users.role'])
            .where('projects.id = :id', { id: project_id }).getRawMany()

        return apiResponse(HttpStatus.OK, CommonSuccess.GET_ALL_MEMBERS, memberQuery)
    }
}
