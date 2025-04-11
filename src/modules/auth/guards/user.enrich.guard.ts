import { Injectable, ExecutionContext, CanActivate, Inject } from "@nestjs/common"
import { ExtractJwt } from "passport-jwt"
import { verify, Algorithm } from "jsonwebtoken"
import { Request as ExpressRequest } from "express"

import { jwtConfig } from "@app.configs"
import { UserModel } from "@models"
import { AuthService } from "../auth.service"
import { JwtPayload } from "../types/jwt-payload"

interface RequestWithUser extends Request {
    user?: Omit<UserModel, 'password'>;
    signedCookies: {
        token?: string;
    };
}

@Injectable()
export class UserOptionalEnrichGuard implements CanActivate {
    constructor(
        @Inject("AuthService") private readonly authService: AuthService,
    ) {}

    getRequest(context: ExecutionContext): RequestWithUser {
        return context.switchToHttp().getRequest<RequestWithUser>()
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = this.getRequest(context)
        const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request) || request.signedCookies.token

        if (token) {
            try {
                const payload = await getJwtPayload(token)

                const user = await this.authService.verifyPayload(payload)

                request.user = user
            } catch (error) {}
        }

        return true
    }
}

const getJwtPayload = (token: string): Promise<JwtPayload> =>
    new Promise((resolve, reject) => {
        verify(token, process.env.SESSION_SECRET, { algorithms: jwtConfig.verifyOptions.algorithms as Algorithm[] }, (error, payload) =>
            error ? reject(error) : resolve(payload as JwtPayload),
        )
    })
