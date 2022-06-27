//import { UserEntity } from "src/modules/users/entity/user.entity";
//import { ProjectEntity } from "src/modules/projects/entity/project.entity";
import { ProjectStatus } from "src/modules/projects/projects.constants";
import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: 'Task' })
export class TaskEntity extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column()
    type: ProjectStatus

    @Column()
    description: string;

    @Column()
    priority: string;

    // @Column()
    // asignees: UserEntity[]

    // @Column()
    // reporter: UserEntity

    // @Column()
    // project: ProjectEntity

    @Column()
    taskParent?: boolean

    @Column()
    attachments?: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn({ nullable: true })
    deleted_at: Date;

}