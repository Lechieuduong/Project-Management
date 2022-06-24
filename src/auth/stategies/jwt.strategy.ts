import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from 'passport-jwt'
import { jwtConfig } from "src/configs/configs.constants";
import IJwtPayload from "../payloads/jwt-payloads";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtConfig.secret,
        })
    }



    async validate(payload: IJwtPayload): Promise<IJwtPayload> {
        return payload;
    }
}