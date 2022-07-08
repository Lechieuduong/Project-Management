import { ConflictException, HttpStatus, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { apiResponse } from "src/common/api-response/apiresponse";
import { EntityRepository, Repository } from "typeorm";
import { UserEntity } from "../users/entity/user.entity";
import { CreateProjectDto } from "./dto/create-project.dto";
import { ProjectEntity } from "./entity/project.entity";
import { ProjectMessage } from "./projects.constants";

@EntityRepository(ProjectEntity)
export class ProjectsRepository extends Repository<ProjectEntity> {
    async createProject(createProjectDto: CreateProjectDto, user: UserEntity) {
        const { projectName, projectCode, startDate, endDate, costs } = createProjectDto;

        const newProject = this.create({
            projectName,
            projectCode,
            startDate,
            endDate,
            costs,
            user
        })
        return await this.save(newProject);
    }
}