import { NotFoundException } from "@nestjs/common";
import { EntityRepository, Repository } from "typeorm";
import { UserEntity } from "./entity/user.entity";

@EntityRepository(UserEntity)
export class UsersRepository extends Repository<UserEntity> {
    async findOneById(id: string): Promise<UserEntity> {
        const user = await this.findOne(id);
        if (!user) {
            throw new NotFoundException(
                `User ID ${id} not found.`
            );
        }
        return user
    }

    async getListMailUser() {
        const listMail = await
            this.createQueryBuilder('user')
                .select('user.email')
                .getMany();

        let res = [];

        listMail.forEach((element) => res.push(element.email));

        return res;
    }

    async getProfile(user: UserEntity) {
        return {
            statusCode: 200,
            message: 'Get profile successfully.',
            data: user,
        };
    }

}