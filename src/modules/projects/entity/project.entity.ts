import { Exclude } from "class-transformer";
import { UserEntity } from "src/modules/users/entity/user.entity";
import { UsersRole } from "src/modules/users/users.constants";
import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ProjectStatus } from "../projects.constants";

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

    @Column("text", { array: true, nullable: true })
    members: ProjectInviteMember[];

    @ManyToOne((_type) => UserEntity, (user) => user.project, { eager: false })
    @Exclude({ toPlainOnly: true })
    user: UserEntity;
}

export interface ProjectInviteMember {
    email: string;
    role: UsersRole;
}