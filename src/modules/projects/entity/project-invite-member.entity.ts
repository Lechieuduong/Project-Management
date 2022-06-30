import { UserEntity } from "src/modules/users/entity/user.entity";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ProjectEntity } from "./project.entity";

@Entity()
export class ProjectInviteMember extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne((_type) => ProjectEntity, (project) => project.members_id, { eager: false })
    project_id?: ProjectEntity;

    @ManyToOne((_type) => UserEntity, (user) => user.inviteUSer_id, { eager: false })
    user_id?: UserEntity;
}