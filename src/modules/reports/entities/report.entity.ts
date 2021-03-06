import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn
} from "typeorm";
import { ProjectEntity } from "src/modules/projects/entity/project.entity";
import { UserEntity } from "src/modules/users/entity/user.entity";

@Entity({ name: 'project_reports' })
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

    @Column({ nullable: true, type: 'float' })
    AVGCostOfODCProject: number;

    @Column({ nullable: true, type: 'float' })
    AVGCostOfPBProject: number;

    @CreateDateColumn({ default: new Date(), type: 'timestamp with time zone' })
    created_at: Date;

    @ManyToOne((_type) => ProjectEntity, (project) => project.report)
    project: ProjectEntity;

    @ManyToOne((_type) => UserEntity, (user) => user.report, { eager: true })
    user: UserEntity;
}