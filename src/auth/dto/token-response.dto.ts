import { UserEntity } from "src/modules/users/entity/user.entity"

export default class TokenResponseDto {
    jwtAccessToken: string;
    user: UserEntity;
}