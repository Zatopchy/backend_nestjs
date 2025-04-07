import { Strategy, ExtractJwt } from "passport-jwt"
import { PassportStrategy } from "@nestjs/passport"
import { Injectable } from "@nestjs/common"
import { UserModel } from "@models"

import { AuthService } from "../auth.service"
import { JwtPayload } from "../types/jwt-payload"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
    constructor(private readonly authService: AuthService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.SESSION_SECRET,
            passReqToCallback: false,
            ignoreExpiration: false,
        })
    }

    validate(payload: JwtPayload): Promise<UserModel> {
        return this.authService.verifyPayload(payload)
    }
}
