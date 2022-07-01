import { Exclude } from "class-transformer";
import { TaskEntity } from "src/modules/tasks/entity/task.entity";
import { UserEntity } from "src/modules/users/entity/user.entity";
import { UsersRole } from "src/modules/users/users.constants";
import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ProjectStatus } from "../projects.constants";
import { ProjectInviteMember } from "./project-invite-member.entity";

@Entity({ name: 'Project' })
export class ProjectEntity extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    projectName: string;

    @Column()
    projectCode: string;

    @Column()
    startDate: Date;

    @Column()
    endDate: Date;

    @Column({ default: ProjectStatus.IN_PROGRESS })
    status: ProjectStatus;

    @Column()
    costs: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deleted_column?: Date;

    @OneToMany((_type) => ProjectInviteMember, (inviteUser) => inviteUser.project_id, { eager: true })
    members_id: ProjectInviteMember[];

    @ManyToOne((_type) => UserEntity, (user) => user.project, { eager: false })
    @Exclude({ toPlainOnly: true })
    user: UserEntity;

    @OneToMany((_type) => TaskEntity, (tasks) => tasks.project_id, { eager: false })
    tasks_id: TaskEntity[];
}
