import { Injectable, ExecutionContext, CanActivate, Inject, UnauthorizedException } from "@nestjs/common"
import { ExtractJwt } from "passport-jwt"
import { verify, Algorithm } from "jsonwebtoken"
import { Request as ExpressRequest } from "express"

import { jwtConfig } from "@app.configs"
import { UserModel } from "@models"
import { AuthService } from "../auth.service"
import { JwtPayload } from "../types/jwt-payload"

interface RequestWithUser extends ExpressRequest {
    user?: Omit<UserModel, 'password'>;
    signedCookies: {
      token?: string;
    };
}

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly authService: AuthService,
    ) {}

    getRequest(context: ExecutionContext): RequestWithUser {
        return context.switchToHttp().getRequest()
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = this.getRequest(context)
        const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request) || request.signedCookies.token

        if (!token) {
            throw new UnauthorizedException()
        }

        try {
            const payload = await getJwtPayload(token)

            request.user = await this.authService.verifyPayload(payload)
            return true
        } catch (error) {
            throw new UnauthorizedException()
        }
    }
}

const getJwtPayload = (token: string): Promise<JwtPayload> =>
    new Promise((resolve, reject) => {
        verify(token, process.env.SESSION_SECRET, { algorithms: jwtConfig.verifyOptions.algorithms as Algorithm[] }, (error, payload) =>
            error ? reject(error) : resolve(payload as JwtPayload),
        )
    })
