import { ProjectEntity } from "src/modules/projects/entity/project.entity";
import { UserEntity } from "src/modules/users/entity/user.entity";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'Report' })
export class ProjectReportEntity extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    InProgress: number;

    @Column()
    Done: number;

    @Column()
    Cancelled: number;

    @Column({ type: 'float' })
    PercentMemOfProject: number;

    @Column({ nullable: true })
    AVGCost: number;

    @ManyToOne((_type) => ProjectEntity, (project) => project.report)
    project: ProjectEntity;

    @ManyToOne((_type) => UserEntity, (user) => user.report)
    user: UserEntity;
}