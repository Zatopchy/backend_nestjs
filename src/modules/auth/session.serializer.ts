import { PassportSerializer } from "@nestjs/passport"
import { Injectable } from "@nestjs/common"
import { UserModel } from "@models"

@Injectable()
export class SessionSerializer extends PassportSerializer {
    serializeUser(user: UserModel, done: (err: Error | null, id?: UserModel) => void): void {
        done(null, user)
    }

    deserializeUser(payload: unknown, done: (err: Error | null, payload?: unknown) => void): void {
        done(null, payload)
    }
}
