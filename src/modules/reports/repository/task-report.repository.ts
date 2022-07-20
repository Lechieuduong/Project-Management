import { EntityRepository, Repository } from "typeorm";
import { TaskReportEntity } from "../entities/task-report";

@EntityRepository(TaskReportEntity)
export class TaskReportRepository extends Repository<TaskReportEntity> { }
