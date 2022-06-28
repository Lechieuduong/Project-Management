//import { UserEntity } from "src/modules/users/entity/user.entity";
//import { ProjectEntity } from "src/modules/projects/entity/project.entity";
import { ProjectStatus } from "src/modules/projects/projects.constants";
import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TaskPriority } from "../tasks.constants";

@Entity({ name: 'Task' })
export class TaskEntity extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ default: ProjectStatus.BUG })
    type: ProjectStatus

    @Column({ default: true })
    description: string;

    @Column({ default: TaskPriority.NONE })
    priority: TaskPriority;

    // @Column()
    // asignees: UserEntity[]

    // @Column()
    // reporter: UserEntity

    // @Column()
    // project: ProjectEntity

    @Column({ nullable: true })
    taskParent?: boolean

    @Column({ nullable: true })
    attachments?: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn({ nullable: true })
    deleted_at: Date;

}