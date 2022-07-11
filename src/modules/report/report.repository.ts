import { EntityRepository, Repository } from "typeorm";
import { ReportEntity } from "./entity/report.entity";

@EntityRepository(ReportEntity)
export class ReportsRepository extends Repository<ReportEntity> {

}