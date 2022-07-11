import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'Report' })
export class ReportEntity extends BaseEntity {
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
}