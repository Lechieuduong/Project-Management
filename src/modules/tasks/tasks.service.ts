import {
    BadRequestException,
    forwardRef,
    HttpStatus,
    Inject,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { apiResponse } from 'src/common/api-response/apiresponse';
import { createQueryBuilder, getConnection, Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskEntity } from './entity/task.entity';
import { TaskType } from './tasks.constants';
import * as fs from 'fs'
import { UserEntity } from '../users/entity/user.entity';
import { UsersRepository } from '../users/users.repository';
import { ProjectInviteMember } from '../projects/entity/project-invite-member.entity';
import { ProjectStatus } from '../projects/projects.constants';
import { SendMailService } from 'src/common/send-mail/send-mail.service';
import { ProjectsRepository } from '../projects/projects.repository';
import { TasksRepository } from './tasks.repository';
import { AssignUserDto } from './dto/assign-user.dto';
import { CommonError, CommonSuccess } from 'src/common/constants/common.constants';
import { UserMesssage } from '../users/users.constants';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(TasksRepository)
        private readonly tasksRepository: TasksRepository,

        @InjectRepository(UsersRepository)
        private readonly userRepository: UsersRepository,

        @InjectRepository(ProjectInviteMember)
        private readonly projectInviteMember: Repository<ProjectInviteMember>,

        @Inject(forwardRef(() => SendMailService))
        private sendMailService: SendMailService,

        @InjectRepository(ProjectsRepository)
        private readonly projectRepository: ProjectsRepository,

    ) { }

    async createTask(
        createTaskDto: CreateTaskDto,
        file: Express.Multer.File,
        user: UserEntity
    ) {
        const { project_id, title, description } = createTaskDto;
        const findProject = await this.projectRepository.findOne(project_id);
        if (findProject) {
            const path = file.path;
            const newTask = this.tasksRepository.create({
                title,
                description,
                image: path,
                user,
                project_id: findProject
            });

            delete newTask.user.project;
            delete newTask.user.created_at;
            delete newTask.user.inviteUSer_id;
            delete newTask.user.password;
            delete newTask.user.verified;
            delete newTask.user.verify_code;
            delete newTask.user.task_id;
            delete newTask.user.report;
            delete newTask.user.updated_at;

            await this.tasksRepository.save(newTask);

            findProject.tasks_id.push(newTask);

            return apiResponse(HttpStatus.CREATED, CommonSuccess.CREATED_TASK_SUCCESS, newTask);
        } else {
            throw new NotFoundException(CommonError.NOT_FOUND_PROJECT);
        }

    }

    async getAllTasks() {
        const found = await createQueryBuilder(TaskEntity, 'task')
            .leftJoinAndSelect('task.subtask', 'Task')
            .leftJoinAndSelect('task.assignee_id', 'Project_Member')
            .leftJoinAndSelect('task.project_id', 'Project')
            .getMany();

        return found;
    }

    async getTaskById(id: string): Promise<TaskEntity> {
        const found = await createQueryBuilder(TaskEntity, 'task')
            .leftJoinAndSelect('task.subtask', 'Task')
            .leftJoinAndSelect('task.assignee_id', 'Project_Member')
            .leftJoinAndSelect('task.project_id', 'Project')
            .where('task.id = :id', { id })
            .getOne();

        if (!found) {
            throw new NotFoundException(CommonError.NOT_FOUND_TASK);
        }

        return found
    }

    async updateTask(
        id: string,
        updateTaskDto: UpdateTaskDto,
        file: Express.Multer.File,
    ) {
        const checkTask = await this.tasksRepository.findOne(id);

        if (!checkTask) {
            throw new NotFoundException(CommonError.NOT_FOUND_TASK);
        }

        if (file) {
            if (fs.existsSync(checkTask.image)) {
                fs.unlinkSync(`./${checkTask.image}`);
            }
            checkTask.image = file.path;
        }

        const { title, status, description, priority } = updateTaskDto;

        checkTask.title = title;

        checkTask.status = status;

        checkTask.description = description;

        checkTask.priority = priority;

        await this.tasksRepository.save(checkTask);

        return apiResponse(HttpStatus.OK, CommonSuccess.UPDATED_TASK_SUCCESS, checkTask);
    }

    async deleteTask(id: string) {
        const result = await this.tasksRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(CommonError.NOT_FOUND_TASK);
        }

        return apiResponse(HttpStatus.OK, CommonSuccess.DELETE_TASK_SUCCESS, {});
    }

    async assignTaskForUser(assignUserDto: AssignUserDto) {
        const { user_id, task_id } = assignUserDto;

        const [findUser, findTask] = await Promise.all([
            this.userRepository.findOne(user_id),
            this.tasksRepository.findOne(task_id),
        ])

        if (findTask.assignee_id.length = 1) {
            const newAssignee = this.projectInviteMember.create({
                user_id: findUser,
                task_id: findTask
            })

            await this.projectInviteMember.save(newAssignee);
            findTask.assignee_id.push(newAssignee)

            if (findTask.status === ProjectStatus.BUG) {
                this.sendMailAssignMemberIfTaskHasBug(findUser.email);
                return apiResponse(HttpStatus.OK, CommonSuccess.ASSIGN_USER_BUG, {});
            } else {
                return apiResponse(HttpStatus.OK, CommonSuccess.ASSIGN_USER, {});
            }
        } else {
            throw new BadRequestException(CommonError.ONLY_ONE_USER)
        }
    }

    async assignTaskForOtherUser(assignUserDto: AssignUserDto) {
        const { user_id, task_id } = assignUserDto;
        const [findUser, findTask] = await Promise.all([
            this.userRepository.findOne(user_id),
            this.tasksRepository.findOne(task_id),
        ])

        if (findTask.assignee_id.length = 1) {
            await getConnection()
                .createQueryBuilder()
                .update(ProjectInviteMember)
                .set({ user_id: findUser })
                .where('task_id = :id', { id: task_id })
                .execute()

            if (findTask.status === ProjectStatus.BUG) {
                this.sendMailAssignMemberIfTaskHasBug(findUser.email);
                return apiResponse(HttpStatus.OK, CommonSuccess.ASSIGN_USER_BUG, {});
            } else {
                return apiResponse(HttpStatus.OK, CommonSuccess.ASSIGN_USER, {});
            }
        } else {
            throw new BadRequestException(CommonError.ONLY_ONE_USER)
        }
    }

    async getReporterAndAssignee(task_id: string) {
        const memberQuery = await createQueryBuilder(ProjectInviteMember, 'project_members')
            .leftJoin('project_members.project_id', 'projects')
            .leftJoinAndSelect('project_members.user_id', 'users')
            .select(['users.id, users.name, users.email, users.avatar, users.role'])
            .where('projects.id = :id', { id: task_id }).getRawMany()

        return apiResponse(HttpStatus.OK, CommonSuccess.GET_ALL_MEMBERS, memberQuery)
    }

    async sendMailAssignMemberIfTaskHasBug(email: string) {
        const user = await this.userRepository.findOne({ email });

        if (!user)
            throw new NotFoundException(UserMesssage.NOT_FOUND_MAIL);

        if (!user.verified)
            throw new BadRequestException(CommonError.NOT_VERIFY_EMAIL);

        const time = new Date().getTime() - user.updated_at.getTime();
        const getTimeSendMail = time / (100 * 60 * 5);

        if (getTimeSendMail < 1) {
            throw new BadRequestException(`Please wait ${(1 - getTimeSendMail) * 5 * 60}s`);
        }

        const url = process.env.DOMAIN + '/tasks/task-has-bug?email=' + email;
        this.sendMailService.sendMailAssignMemberIfTaskHasBug(url, email)

        return apiResponse(HttpStatus.OK, CommonSuccess.TASK_HAS_BUG, {})
    }

    async createSubTask(
        createTaskDto: CreateTaskDto,
        file: Express.Multer.File,
        user: UserEntity,
        id: string
    ) {
        const findTask = await this.tasksRepository.findOne({ id });
        if (this.projectInviteMember.findOne(user.id)) {
            const { title } = createTaskDto;
            const path = file.path;
            const newSubTask = this.tasksRepository.create({
                title,
                image: path,
                user,
                type: TaskType.SUBTASK
            });

            newSubTask.taskParent = findTask;

            await this.tasksRepository.save(newSubTask);

            return apiResponse(HttpStatus.CREATED, CommonSuccess.CREATED_SUBTASK_SUCCESS, {});
        } else {
            throw new NotFoundException(CommonError.NOT_FOUND_USER)
        }
    }

    async updateSubTask(
        id: string,
        updateTaskDto: UpdateTaskDto,
        file: Express.Multer.File,
    ) {
        const checkTask = await this.tasksRepository.findOne(id);
        if (checkTask.type === TaskType.SUBTASK) {
            if (!checkTask) {
                throw new NotFoundException(CommonError.NOT_FOUND_SUBTASK);
            }

            if (file) {
                if (fs.existsSync(checkTask.image)) {
                    fs.unlinkSync(`./${checkTask.image}`);
                }
                checkTask.image = file.path;
            }

            const { title, status, description, priority } = updateTaskDto;

            checkTask.title = title;

            checkTask.status = status;

            checkTask.description = description;

            checkTask.priority = priority;

            await this.tasksRepository.save(checkTask);

            return apiResponse(HttpStatus.OK, CommonSuccess.UPDATED_SUBTASK_SUCCESS, checkTask);
        } else {
            throw new BadRequestException(CommonError.NOT_SUBTASK);
        }
    }
}
