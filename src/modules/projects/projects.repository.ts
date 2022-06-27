import { ConflictException, HttpStatus, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { apiResponse } from "src/common/api-response/apiresponse";
import { EntityRepository, Repository } from "typeorm";
import { CreateProjectDto } from "./dto/create-project.dto";
import { ProjectEntity } from "./entity/project.entity";
import { ProjectMessage } from "./projects.constants";

@EntityRepository(ProjectEntity)
export class ProjectsRepository extends Repository<ProjectEntity> {
    async createProject(createProjectDto: CreateProjectDto) {
        const { projectName, projectCode, startDate, endDate, costs } = createProjectDto;

        const newProject = new ProjectEntity();
        newProject.projectName = projectName;
        newProject.projectCode = projectCode;
        newProject.startDate = startDate;
        newProject.endDate = endDate;
        newProject.costs = costs;

        try {
            await this.save(newProject);

            return apiResponse(HttpStatus.OK, 'Create project successfully', {});
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