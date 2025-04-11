import { PassportStrategy } from "@nestjs/passport"
import { Injectable } from "@nestjs/common"
import { Strategy } from "passport-local"

import { UserModel } from "@models"
import { AuthService } from "../auth.service"
import { SignIn } from "../dto"

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, "local") {
    constructor(private readonly authService: AuthService) {
        super({
            usernameField: "email",
            passReqToCallback: false,
        })
    }

    validate(email: string, password: string): Promise<UserModel> {
        const signIn = new SignIn()
        signIn.password = password
        signIn.email = email

        return this.authService.signIn(signIn)
    }
}
