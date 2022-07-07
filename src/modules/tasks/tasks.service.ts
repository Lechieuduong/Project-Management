import { BadRequestException, ConflictException, forwardRef, HttpStatus, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { apiResponse } from 'src/common/api-response/apiresponse';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskEntity } from './entity/task.entity';
import { TaskMessage } from './tasks.constants';
import * as path from 'path'
import * as fs from 'fs'
import { UserEntity } from '../users/entity/user.entity';
import { UsersRepository } from '../users/users.repository';
import { ProjectInviteMember } from '../projects/entity/project-invite-member.entity';
import { title } from 'process';
import { ProjectStatus } from '../projects/projects.constants';
import moment from 'moment';
import { SendMailService } from 'src/common/send-mail/send-mail.service';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(TaskEntity)
        private readonly tasksRepository: Repository<TaskEntity>,

        @InjectRepository(UsersRepository)
        private readonly userRepository: UsersRepository,

        @InjectRepository(ProjectInviteMember)
        private readonly projectInviteMember: Repository<ProjectInviteMember>,

        @Inject(forwardRef(() => SendMailService))
        private sendMailService: SendMailService
    ) { }

    async createTask(
        createTaskDto: CreateTaskDto,
        file: Express.Multer.File,
        user: UserEntity
    ) {
        const { title } = createTaskDto;
        const path = file.path;
        const newTask = this.tasksRepository.create({
            title,
            image: path,
            user
        });

        try {
            await this.tasksRepository.save(newTask);

            return apiResponse(HttpStatus.OK, 'Create task successful', {});
        } catch (error) {
            console.log(error);

            if (error.code === '23505') {
                throw new ConflictException(TaskMessage.TASK_EXIST);
            }

            throw new InternalServerErrorException();
        }
    }

    async getAllTasks() {
        return this.tasksRepository.find();
    }

    async getTaskById(id: string): Promise<TaskEntity> {
        const found = await this.tasksRepository.findOne(id);

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
        try {
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
        } catch (error) {
            throw new BadRequestException('Sever error')
        }
    }

    async deleteTask(id: string) {
        const result = await this.tasksRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Task with Id: ${id} is not found`);
        }

        return apiResponse(HttpStatus.OK, 'Delete successful.', {});
    }

    async assignTaskForUser(user_id: string, task_id: string) {
        try {
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
        } catch (error) {
            if (error.code === '23505') {
                throw new ConflictException(
                    `This member already assign to this task.`,
                )
            }
            throw new InternalServerErrorException();
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

}
