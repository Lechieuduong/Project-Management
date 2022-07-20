import {
    BaseEntity,
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn
} from "typeorm";
import { TaskEntity } from "src/modules/tasks/entity/task.entity";

@Entity({ name: 'Task_Report' })
export class TaskReportEntity extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    InProgress: number;

    @Column()
    Done: number;

    @Column()
    Bug: number;

    @Column({ type: 'float' })
    PercentOfBug: number;

    @ManyToOne((_type) => TaskEntity)
    task: TaskEntity
}