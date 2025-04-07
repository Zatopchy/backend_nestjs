import { Injectable, ExecutionContext, CanActivate, Inject, UnauthorizedException } from "@nestjs/common"
import { ExtractJwt } from "passport-jwt"
import { verify } from "jsonwebtoken"

import { jwtConfig } from "@app.configs"
import { AuthService } from "../auth.service"

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly authService: AuthService,
    ) {}

    getRequest<T = any>(context: ExecutionContext): T {
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

const getJwtPayload = (token: string) =>
    new Promise<any>((resolve, reject) => {
        verify(token, process.env.SESSION_SECRET, { algorithms: jwtConfig.verifyOptions.algorithms as any }, (error, payload) =>
            error ? reject(error) : resolve(payload),
        )
    })
