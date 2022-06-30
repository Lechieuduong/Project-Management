import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from 'passport-jwt'
import { jwtConfig } from "src/configs/configs.constants";
import { UserEntity } from "src/modules/users/entity/user.entity";
import { UsersService } from "src/modules/users/users.service";
import IJwtPayload from "../payloads/jwt-payloads";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly userService: UsersService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtConfig.secret,
        })
    }



    async validate(payload: IJwtPayload): Promise<UserEntity> {
        return this.userService.findUserByPayLoad(payload);
    }
}