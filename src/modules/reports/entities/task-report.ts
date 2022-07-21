import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn
} from "typeorm";
import { TaskEntity } from "src/modules/tasks/entity/task.entity";

@Entity({ name: 'task_reports' })
export class TaskReportEntity extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    InProgress: number;

    @Column()
    Done: number;

    @Column()
    Bug: number;

    @CreateDateColumn({ default: new Date(), type: 'timestamp with time zone' })
    created_at: Date;

    @Column({ type: 'float' })
    PercentOfBug: number;

    @ManyToOne((_type) => TaskEntity)
    task: TaskEntity
}