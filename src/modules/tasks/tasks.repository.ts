import { EntityRepository, Repository } from "typeorm";
import { TaskEntity } from "./entity/task.entity";

@EntityRepository(TaskEntity)
export class TasksRepository extends Repository<TaskEntity> {

}