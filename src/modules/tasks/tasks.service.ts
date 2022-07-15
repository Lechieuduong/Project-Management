import { BadRequestException, ConflictException, forwardRef, HttpStatus, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { apiResponse } from 'src/common/api-response/apiresponse';
import { createQueryBuilder, Repository } from 'typeorm';
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
        private readonly projectRepository: ProjectsRepository
    ) { }

    async createTask(
        createTaskDto: CreateTaskDto,
        file: Express.Multer.File,
        user: UserEntity,
        id: string
    ) {
        const findProject = await this.projectRepository.findOne(id);

        const { title } = createTaskDto;
        const path = file.path;
        const newTask = this.tasksRepository.create({
            title,
            image: path,
            user
        });

        newTask.project_id = findProject;

        await this.assignTaskForUser(user.id, newTask.id)

        this.tasksRepository.save(newTask);

        findProject.tasks_id.push(newTask);

        return apiResponse(HttpStatus.OK, 'Create task successful', {});

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
            throw new NotFoundException(`Task with ID: ${id} is not found`);
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
            return apiResponse(404, 'Task is not found');
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

        //checkTask.attachments.push(files.toString());

        await this.tasksRepository.save(checkTask);

        return apiResponse(HttpStatus.OK, 'Update Task Successful', checkTask);
    }

    async deleteTask(id: string) {
        const result = await this.tasksRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Task with Id: ${id} is not found`);
        }

        return apiResponse(HttpStatus.OK, 'Delete successful.', {});
    }

    async assignTaskForUser(user_id: string, task_id: string) {
        const findUser = await this.userRepository.findOne(user_id);
        const findTask = await this.tasksRepository.findOne(task_id);
        if (findTask.assignee_id.length >= 1) {
            return apiResponse(HttpStatus.BAD_REQUEST, 'Only assign for 1 people', {});
        } else {
            const assignUser = this.projectInviteMember.create({
                user_id: findUser,
                task_id: findTask
            })

            this.projectInviteMember.save(assignUser);
            findTask.assignee_id.push(assignUser);
            if (findTask.status === ProjectStatus.BUG) {
                this.sendMailAssignMemberIfTaskHasBug(findUser.email);
                return apiResponse(HttpStatus.OK, 'Assign successful but this task has bug', {});
            } else {
                return apiResponse(HttpStatus.OK, 'Assign successful', {});
            }
        }
    }

    async sendMailAssignMemberIfTaskHasBug(email: string) {
        const user = await this.userRepository.findOne({ email });

        if (!user)
            throw new NotFoundException(`User have email: ${email} is not found`);

        if (!user.verified)
            throw new BadRequestException('You have to register or veried your account');

        const time = new Date().getTime() - user.updated_at.getTime();
        const getTimeSendMail = time / (100 * 60 * 5);

        if (getTimeSendMail < 1) {
            throw new BadRequestException(`Please wait ${(1 - getTimeSendMail) * 5 * 60}s`);
        }

        const url = process.env.DOMAIN + 'tasks/task_has_bug?email=' + email;
        const res = await this.sendMailService.sendMailAssignMemberIfTaskHasBug(url, email)

        return apiResponse(HttpStatus.OK, res.response, {})
    }

    async createSubTask(
        createTaskDto: CreateTaskDto,
        file: Express.Multer.File,
        user: UserEntity,
        id: string
    ) {
        const findTask = await this.tasksRepository.findOne({ id });
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

        return apiResponse(HttpStatus.OK, 'Create sub-task successful', {});
    }

}
