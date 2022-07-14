import { Exclude } from "class-transformer";
import { ProjectReportEntity } from "src/modules/reports/entities/report.entity";
import { TaskEntity } from "src/modules/tasks/entity/task.entity";
import { UserEntity } from "src/modules/users/entity/user.entity";
import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ProjectStatus, ProjectType } from "../projects.constants";
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

    @Column({ default: ProjectType.ODC })
    type: ProjectType

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

    @OneToMany((_type) => ProjectReportEntity, (report) => report.project)
    report: ProjectReportEntity;
}
