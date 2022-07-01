import { ProjectInviteMember } from "src/modules/projects/entity/project-invite-member.entity";
import { ProjectEntity } from "src/modules/projects/entity/project.entity";
import { ProjectStatus } from "src/modules/projects/projects.constants";
import { UserEntity } from "src/modules/users/entity/user.entity";
import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TaskPriority } from "../tasks.constants";

@Entity({ name: 'Task' })
export class TaskEntity extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ default: ProjectStatus.BUG })
    type: ProjectStatus

    @Column({ nullable: true })
    description: string;

    @Column({ default: TaskPriority.NONE })
    priority: TaskPriority;

    @Column()
    image: string;

    @Column({ nullable: true })
    taskParent?: boolean

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
    user_id?: UserEntity;

    //Assignee
    @ManyToOne((_type) => ProjectInviteMember, (assignee) => assignee.task_id)
    assignee_id?: ProjectInviteMember;

    @ManyToOne((_type) => ProjectEntity, (project) => project.tasks_id)
    project_id?: ProjectEntity;
}