import { EntityRepository, Repository } from "typeorm";
import { ProjectReportEntity } from "../entities/report.entity";

@EntityRepository(ProjectReportEntity)
export class ProjectReportRepository extends Repository<ProjectReportEntity> {

}
