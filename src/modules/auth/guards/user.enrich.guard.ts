import { Injectable, ExecutionContext, CanActivate, Inject } from "@nestjs/common"
import { ExtractJwt } from "passport-jwt"
import { verify } from "jsonwebtoken"

import { jwtConfig } from "@app.configs"
import { AuthService } from "../auth.service"

@Injectable()
export class UserOptionalEnrichGuard implements CanActivate {
    constructor(
        @Inject("AuthService") private readonly authService: AuthService,
    ) {}

    getRequest<T = any>(context: ExecutionContext): T {
        return context.switchToHttp().getRequest()
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

const getJwtPayload = (token: string) =>
    new Promise<any>((resolve, reject) => {
        verify(token, process.env.SESSION_SECRET, { algorithms: jwtConfig.verifyOptions.algorithms as any }, (error, payload) =>
            error ? reject(error) : resolve(payload),
        )
    })
