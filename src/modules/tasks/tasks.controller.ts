import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Roles } from 'src/auth/decorators/role.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserEntity } from '../users/entity/user.entity';
import { UsersRole } from '../users/users.constants';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskEntity } from './entity/task.entity';
import { TasksService } from './tasks.service';

@ApiTags('Task')
//@ApiBearerAuth()
//@UseGuards(AuthGuard())
@Controller('tasks')
export class TasksController {
    constructor(private readonly taskService: TasksService) { }

    @Post('/create_task')
    @ApiConsumes('multipart/form-data')
    // @UseGuards(AuthGuard(), RolesGuard)
    // @Roles(UsersRole.ADMIN, UsersRole.SUPERADMIN)
    @UseInterceptors(FileInterceptor('image',
        {
            storage: diskStorage({
                destination: './upload/task-img',
                filename: (req, file, cb) => {
                    // Generating a 32 random chars long string
                    const randomName = Array(32)
                        .fill(null)
                        .map(() => Math.round(Math.random() * 16).toString(16)).join('');
                    //Calling the callback passing the random name generated with the original extension name
                    cb(null, `${randomName}${extname(file.originalname)}`);
                },
            }),
        })
    )
    createTask(
        @Body() createTaskDto: CreateTaskDto,
        @UploadedFile() file: Express.Multer.File,
        @GetUser() user: UserEntity,
        @Param('project-id') id: string
    ) {
        return this.taskService.createTask(createTaskDto, file, user, id);
    }

    @Get('/get_all_tasks')
    getAllTasks() {
        return this.taskService.getAllTasks();
    }

    @Get('/get_one_task/:id')
    getTaskById(@Param('id') id: string): Promise<TaskEntity> {
        return this.taskService.getTaskById(id);
    }

    @Patch('/update_task/:id')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('image',
        {
            storage: diskStorage({
                destination: './upload/task-img',
                filename: (req, file, cb) => {
                    // Generating a 32 random chars long string
                    const randomName = Array(32)
                        .fill(null)
                        .map(() => Math.round(Math.random() * 16).toString(16)).join('');
                    //Calling the callback passing the random name generated with the original extension name
                    cb(null, `${randomName}${extname(file.originalname)}`);
                },
            }),
        })
    )
    updateTask(
        @Body() updateTaskDto: UpdateTaskDto,
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.taskService.updateTask(id, updateTaskDto, file);
    }

    @Delete('delete_task/:id')
    deleteTask(
        @Param('id') id: string
    ) {
        return this.taskService.deleteTask(id);
    }

    @Post('/assign_user_into_task/:user_id&:task_id')
    @ApiBearerAuth()
    assignTaskForUser(
        @Param('user_id') user_id: string,
        @Param('task_id') task_id: string
    ) {
        return this.taskService.assignTaskForUser(user_id, task_id);
    }

    @Post('/create_subtask/:id')
    @ApiConsumes('multipart/form-data')
    // @UseGuards(AuthGuard(), RolesGuard)
    // @Roles(UsersRole.ADMIN, UsersRole.SUPERADMIN)
    @UseInterceptors(FileInterceptor('image',
        {
            storage: diskStorage({
                destination: './upload/task-img',
                filename: (req, file, cb) => {
                    // Generating a 32 random chars long string
                    const randomName = Array(32)
                        .fill(null)
                        .map(() => Math.round(Math.random() * 16).toString(16)).join('');
                    //Calling the callback passing the random name generated with the original extension name
                    cb(null, `${randomName}${extname(file.originalname)}`);
                },
            }),
        })
    )
    createSubTask(
        @Body() createTaskDto: CreateTaskDto,
        @UploadedFile() file: Express.Multer.File,
        @GetUser() user: UserEntity,
        @Param('id') id: string
    ) {
        return this.taskService.createSubTask(createTaskDto, file, user, id);
    }
}
