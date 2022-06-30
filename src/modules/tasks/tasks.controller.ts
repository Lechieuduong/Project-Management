import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskEntity } from './entity/task.entity';
import { TasksService } from './tasks.service';

@ApiTags('Task')
@Controller('tasks')
export class TasksController {
    constructor(private readonly taskService: TasksService) { }

    // @Post('/create_task')
    // createTask(
    //     @Body() createTaskDto: CreateTaskDto
    // ) {
    //     return this.taskService.createTask(createTaskDto);
    // }

    @Get('/get_all_tasks')
    getAllTasks() {
        return this.taskService.getAllTasks();
    }

    @Get('/get_one_task/:id')
    getTaskById(@Param('id') id: string): Promise<TaskEntity> {
        return this.taskService.getTaskById(id);
    }

    @Put('/update_task/:id')
    @ApiConsumes('multipart/form-data')
    updateTask(
        @Body() updateTaskDto: UpdateTaskDto,
        @Param('id') id: string
    ) {
        return this.taskService.updateTask(id, updateTaskDto);
    }

    @Delete('delete_task/:id')
    deleteTask(
        @Param('id') id: string
    ) {
        return this.taskService.deleteTask(id);
    }
}
