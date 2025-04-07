import { PassportModule } from "@nestjs/passport"
import { Global, Module } from "@nestjs/common"
import { JwtModule } from "@nestjs/jwt"

import * as config from "@app.configs"
import { UserModule } from "../users"
import { JwtStrategy, LocalStrategy } from "./strategies"
import { SessionSerializer } from "./session.serializer"
import { AuthController } from "./auth.controller"
import { AuthService } from "./auth.service"
import { AuthGuard } from "./guards"

@Global()
@Module({
    imports: [
        UserModule,
        PassportModule.register({ defaultStrategy: "jwt" }),
        JwtModule.registerAsync(config.jwtStrategy),
    ],

    providers: [
        AuthService,
        LocalStrategy,
        JwtStrategy,
        SessionSerializer,
        AuthGuard
    ],

    controllers: [AuthController],
    exports: [AuthService, AuthGuard],
})
export class AuthModule {}
