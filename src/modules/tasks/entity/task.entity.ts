import { type } from "os";
import { ProjectInviteMember } from "src/modules/projects/entity/project-invite-member.entity";
import { ProjectEntity } from "src/modules/projects/entity/project.entity";
import { ProjectStatus } from "src/modules/projects/projects.constants";
import { UserEntity } from "src/modules/users/entity/user.entity";
import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TaskPriority, TaskType } from "../tasks.constants";

@Entity({ name: 'Task' })
export class TaskEntity extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ default: TaskType.TASK })
    type: TaskType;

    @Column({ default: ProjectStatus.BUG })
    status: ProjectStatus

    @Column({ nullable: true })
    description: string;

    @Column({ default: TaskPriority.NONE })
    priority: TaskPriority;

    @Column()
    image: string;

    @ManyToOne(type => TaskEntity, task => task.subtask)
    taskParent: TaskEntity;

    @OneToMany(type => TaskEntity, task => task.taskParent)
    subtask: TaskEntity[];

    @Column("text", { array: true, nullable: true })
    attachments?: string[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn({ nullable: true })
    deleted_at: Date;

    //Reporter
    @ManyToOne((_type) => UserEntity, (user) => user.task_id)
    user: UserEntity;

    //Assignee
    @OneToMany((_type) => ProjectInviteMember, (inviteUSer) => inviteUSer.task_id, { eager: true })
    assignee_id: ProjectInviteMember[];

    @ManyToOne((_type) => ProjectEntity, (project) => project.tasks_id)
    project_id: ProjectEntity;
}
