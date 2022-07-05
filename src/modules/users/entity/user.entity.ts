import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import * as bcrypt from 'bcrypt';
import { Exclude } from "class-transformer";
import { defaultNameLength } from "src/common/constants/common.constants";
import { UsersRole } from "../users.constants";
import { ProjectEntity } from "src/modules/projects/entity/project.entity";
import { ProjectInviteMember } from "src/modules/projects/entity/project-invite-member.entity";
import { TaskEntity } from "src/modules/tasks/entity/task.entity";

@Entity({ name: 'User' })
export class UserEntity extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column({ length: defaultNameLength })
    name: string;

    @Column({ default: 'https://bit.ly/3McoJN1' })
    avatar: string;

    @Column({ nullable: true })
    verify_code: string;

    @Column({ default: false })
    verified: boolean;

    @Column({ default: UsersRole.USER })
    role: string;

    @Exclude({ toPlainOnly: true })
    @Column({ nullable: true })
    password: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @OneToMany((_type) => ProjectEntity, (projects) => projects.user, { eager: true })
    project: ProjectEntity[];

    @OneToMany((_type) => ProjectInviteMember, (inviteUser) => inviteUser.user_id, { eager: true })
    inviteUSer_id: ProjectInviteMember[];

    @OneToMany((_type) => TaskEntity, (tasks) => tasks.user, { eager: true })
    task_id: TaskEntity[];

    async validatePassword(passwword: string): Promise<boolean> {
        const hashedPassword = await bcrypt.compare(passwword, this.password);
        return hashedPassword;
    }
}