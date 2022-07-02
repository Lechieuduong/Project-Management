import { BadRequestException, ConflictException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { apiResponse } from 'src/common/api-response/apiresponse';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskEntity } from './entity/task.entity';
import { TaskMessage } from './tasks.constants';
import * as path from 'path'
import * as fs from 'fs'

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(TaskEntity)
        private readonly tasksRepository: Repository<TaskEntity>
    ) { }

    async createTask(
        createTaskDto: CreateTaskDto,
        file: Express.Multer.File

    ) {
        const { title } = createTaskDto;
        const path = file.path;
        const newTask = this.tasksRepository.create({
            title,
            image: path
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

        return found;
    }

    async updateTask(
        id: string,
        updateTaskDto: UpdateTaskDto,
        file: Express.Multer.File
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

            const { title, type, description, priority } = updateTaskDto;
            checkTask.title = title;

            checkTask.type = type;

            checkTask.description = description;

            checkTask.priority = priority;

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
}
