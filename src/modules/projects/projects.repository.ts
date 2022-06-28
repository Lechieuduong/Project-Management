import { ConflictException, HttpStatus, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { apiResponse } from "src/common/api-response/apiresponse";
import { EntityRepository, Repository } from "typeorm";
import { UserEntity } from "../users/entity/user.entity";
import { CreateProjectDto } from "./dto/create-project.dto";
import { ProjectEntity } from "./entity/project.entity";
import { ProjectMessage } from "./projects.constants";

@EntityRepository(ProjectEntity)
export class ProjectsRepository extends Repository<ProjectEntity> {
    async createProject(createProjectDto: CreateProjectDto, user: UserEntity): Promise<ProjectEntity> {
        const { projectName, projectCode, startDate, endDate, costs } = createProjectDto;

        const newProject = this.create({
            projectName,
            projectCode,
            startDate,
            endDate,
            costs,
            user
        })

        try {
            await this.save(newProject);

            return newProject;
        } catch (error) {
            if (error.code === '23505') {
                throw new ConflictException(ProjectMessage.PROJECT_EXIST);
            }

            throw new InternalServerErrorException();
        }
    }

    async getAllProjects() {
        return this.find();
    }
}