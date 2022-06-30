import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { apiResponse } from 'src/common/api-response/apiresponse';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskEntity } from './entity/task.entity';
import { TaskRepository } from './tasks.repository';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(TaskRepository)
        private readonly tasksRepository: TaskRepository
    ) { }

    // async createTask(
    //     createTaskDto: CreateTaskDto,
    // ) {
    //     return this.tasksRepository.createTask(createTaskDto);
    // }

    async getAllTasks() {
        return this.tasksRepository.getAllTasks();
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
    ) {
        const checkTask = await this.getTaskById(id);

        if (!checkTask)
            throw new NotFoundException(`Task with ID: ${id} is not found.`);

        const { title, type, priority, description, attachments } = updateTaskDto;

        checkTask.title = title;

        checkTask.type = type;

        checkTask.priority = priority;

        checkTask.description = description;

        //checkTask.attachments = attachments;

        await this.tasksRepository.save(checkTask);

        return apiResponse(HttpStatus.OK, 'Update task successfully.', {});
    }

    async deleteTask(id: string) {
        const result = await this.tasksRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Task with Id: ${id} is not found`);
        }

        return apiResponse(HttpStatus.OK, 'Delete successful.', {});
    }
}
