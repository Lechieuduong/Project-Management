import { ConflictException, HttpStatus, InternalServerErrorException } from "@nestjs/common";
import { apiResponse } from "src/common/api-response/apiresponse";
import { EntityRepository, Repository } from "typeorm";
import { CreateTaskDto } from "./dto/create-task.dto";
import { TaskEntity } from "./entity/task.entity";
import { TaskMessage } from "./tasks.constants";

@EntityRepository(TaskEntity)
export class TaskRepository extends Repository<TaskEntity> {
    async createTask(
        createTaskDto: CreateTaskDto,
        files: {
            image: Express.Multer.File;
        }
    ) {
        const { title } = createTaskDto;

        const newTask = this.create({
            title
        });

        try {
            await this.save(newTask);

            return apiResponse(HttpStatus.OK, 'Create task successful', {});
        } catch (error) {
            if (error.code === '23505') {
                throw new ConflictException(TaskMessage.TASK_EXIST);
            }

            throw new InternalServerErrorException();
        }
    }

    async getAllTasks() {
        return this.find();
    }
}