import { BadRequestException, ConflictException, forwardRef, HttpStatus, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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

        await this.assignTaskForUser({ user_id: user.id, task_id: newTask.id })

        this.tasksRepository.save(newTask);

        findProject.tasks_id.push(newTask);

        return apiResponse(HttpStatus.CREATED, 'Create task successful', {});

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

    async assignTaskForUser(assignUserDto: AssignUserDto) {
        const { user_id, task_id } = assignUserDto;
        const findUser = await this.userRepository.findOne(user_id);
        const findTask = await this.tasksRepository.findOne(task_id);

        if (findTask.assignee_id.length = 1) {
            await getConnection()
                .createQueryBuilder()
                .update(ProjectInviteMember)
                .set({ user_id: findUser })
                .where('task_id = :id', { id: task_id })
                .execute()

            //findTask.assignee_id.push();
            if (findTask.status === ProjectStatus.BUG) {
                this.sendMailAssignMemberIfTaskHasBug(findUser.email);
                return apiResponse(HttpStatus.OK, 'Assign successful but this task has bug', {});
            } else {
                return apiResponse(HttpStatus.OK, 'Assign successful', {});
            }
        } else {
            throw new BadRequestException('Only assign for 1 people')
        }
    }

    async sendMailAssignMemberIfTaskHasBug(email: string) {
        const user = await this.userRepository.findOne({ email });

        if (!user)
            throw new NotFoundException(`User have email: ${email} is not found`);

        if (!user.verified)
            throw new BadRequestException('You have to register or verified your account');

        const time = new Date().getTime() - user.updated_at.getTime();
        const getTimeSendMail = time / (100 * 60 * 5);

        if (getTimeSendMail < 1) {
            throw new BadRequestException(`Please wait ${(1 - getTimeSendMail) * 5 * 60}s`);
        }

        const url = process.env.DOMAIN + '/tasks/task-has-bug?email=' + email;
        this.sendMailService.sendMailAssignMemberIfTaskHasBug(url, email)

        return apiResponse(HttpStatus.OK, 'Your task has a bug', {})
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

            return apiResponse(HttpStatus.CREATED, 'Create sub-task successful', {});
        } else {
            throw new NotFoundException('User is not assigned in this task')
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
                throw new NotFoundException('Sub Task is not found');
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

            return apiResponse(HttpStatus.OK, 'Update Sub-Task Successful', checkTask);
        } else {
            throw new BadRequestException('This is not subtask');
        }
    }
}
