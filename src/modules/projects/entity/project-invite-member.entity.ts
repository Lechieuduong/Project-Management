import {
    BaseEntity,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn
} from "typeorm";
import { TaskEntity } from "src/modules/tasks/entity/task.entity";
import { UserEntity } from "src/modules/users/entity/user.entity";
import { ProjectEntity } from "./project.entity";

@Entity({ name: 'Project_Member' })
export class ProjectInviteMember extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne((_type) => ProjectEntity, (project) => project.members_id, { eager: false })
    project_id?: ProjectEntity;

    @ManyToOne((_type) => UserEntity, (user) => user.inviteUSer_id, { eager: false })
    user_id?: UserEntity;

    @ManyToOne((_type) => TaskEntity, (task) => task.assignee_id, { eager: false })
    task_id?: TaskEntity;
}