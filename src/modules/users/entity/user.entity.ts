import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import * as bcrypt from 'bcrypt';
import { Exclude } from "class-transformer";
import { defaultNameLength } from "src/common/constants/common.constants";
import { UsersRole } from "../users.constants";

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

    @Column({ type: 'enum', enum: UsersRole, default: UsersRole.USER })
    role: UsersRole;

    @Exclude({ toPlainOnly: true })
    @Column({ nullable: true })
    password: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    async validatePassword(passwword: string): Promise<boolean> {
        const hashedPassword = await bcrypt.compare(passwword, this.password);
        return hashedPassword;
    }
}