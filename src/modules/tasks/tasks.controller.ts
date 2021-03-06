import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UploadedFile,
    UploadedFiles,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AnyFilesInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Roles } from 'src/auth/decorators/role.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserEntity } from '../users/entity/user.entity';
import { UsersRole } from '../users/users.constants';
import { AssignUserDto } from './dto/assign-user.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskEntity } from './entity/task.entity';
import { TasksService } from './tasks.service';

@ApiTags('Task')
@ApiBearerAuth()
@UseGuards(AuthGuard(), RolesGuard)
@Controller('tasks')
export class TasksController {
    constructor(private readonly taskService: TasksService) { }

    @Post('/create-task')
    @ApiConsumes('multipart/form-data')
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(UsersRole.ADMIN, UsersRole.SUPERADMIN)
    @UseInterceptors(FileInterceptor('image',
        {
            storage: diskStorage({
                destination: './upload/task-img',
                filename: (req, file, cb) => {
                    const randomName = Array(32)
                        .fill(null)
                        .map(() => Math.round(Math.random() * 16).toString(16)).join('');
                    cb(null, `${randomName}${extname(file.originalname)}`);
                },
            }),
        })
    )
    createTask(
        @Body() createTaskDto: CreateTaskDto,
        @UploadedFile() file: Express.Multer.File,
        @GetUser() user: UserEntity
    ) {
        return this.taskService.createTask(createTaskDto, file, user);
    }

    @Get('/get-all-tasks')
    getAllTasks() {
        return this.taskService.getAllTasks();
    }

    @Get('/get-one-task/:id')
    getTaskById(@Param('id') id: string): Promise<TaskEntity> {
        return this.taskService.getTaskById(id);
    }

    @Patch('/update-task/:id')
    @ApiConsumes('multipart/form-data')
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(UsersRole.ADMIN, UsersRole.SUPERADMIN)
    @UseInterceptors(FileInterceptor('image',
        {
            storage: diskStorage({
                destination: './upload/task-img',
                filename: (req, file, cb) => {
                    const randomName = Array(32)
                        .fill(null)
                        .map(() => Math.round(Math.random() * 16).toString(16)).join('');
                    cb(null, `${randomName}${extname(file.originalname)}`);
                },
            }),
        })
    )
    updateTask(
        @Body() updateTaskDto: UpdateTaskDto,
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
        //@UploadedFiles() files: Array<Express.Multer.File>
    ) {
        return this.taskService.updateTask(id, updateTaskDto, file);
    }

    @Delete('delete_task/:id')
    deleteTask(
        @Param('id') id: string
    ) {
        return this.taskService.deleteTask(id);
    }

    @Post('/assign-user-into-task')
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(UsersRole.ADMIN, UsersRole.SUPERADMIN)
    assignTaskForUser(
        @Body() assignUserDto: AssignUserDto
    ) {
        return this.taskService.assignTaskForUser(assignUserDto);
    }

    @Patch('/change-assign-user-into-task')
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(UsersRole.ADMIN, UsersRole.SUPERADMIN)
    assignTaskForAnotherUser(
        @Body() assignUserDto: AssignUserDto
    ) {
        return this.taskService.assignTaskForOtherUser(assignUserDto);
    }

    @Post('/create-subtask/:id')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('image',
        {
            storage: diskStorage({
                destination: './upload/task-img',
                filename: (req, file, cb) => {
                    const randomName = Array(32)
                        .fill(null)
                        .map(() => Math.round(Math.random() * 16).toString(16)).join('');
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

    @Patch('/update-subtask/:id')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('image',
        {
            storage: diskStorage({
                destination: './upload/task-img',
                filename: (req, file, cb) => {
                    const randomName = Array(32)
                        .fill(null)
                        .map(() => Math.round(Math.random() * 16).toString(16)).join('');
                    cb(null, `${randomName}${extname(file.originalname)}`);
                },
            }),
        }
    ))
    updateSubTask(
        @Body() updateTaskDto: UpdateTaskDto,
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.taskService.updateSubTask(id, updateTaskDto, file);
    }
}
