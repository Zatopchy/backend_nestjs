import { compare as bcryptCompare } from 'bcrypt';
import { Injectable, UnauthorizedException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { UserModel } from "@models"

import { SignIn, SignUp } from "./dto"
import { JwtPayload } from './types/jwt-payload';
import { UsersService } from "../users/users.service"

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async register(signUp: SignUp): Promise<UserModel> {
        try {
            const isUserExists = await this.usersService.findOne(signUp.email)
            if (isUserExists) {
                throw new UnauthorizedException(`Этот пользователь уже зарегистрирован в системе`)
            }

            const user = await this.usersService.create(signUp)

            delete user.password
            return user
        } catch (error) {
            throw error
        }
    }

    async login(signIn: SignIn): Promise<UserModel> {
        let user = await this.usersService.findOne(signIn.email)

        if (!user || !(await bcryptCompare(signIn.password, user.password))) {
            throw new UnauthorizedException(`Неверный email или пароль`)
        }

        return user
    }

    async verifyPayload(payload: JwtPayload): Promise<UserModel> {
        let user: UserModel

        try {
            user = await this.usersService.findOne(payload.sub)
        } catch (error) {
            throw new UnauthorizedException(`Пользователь не найден: ${payload.sub}`)
        }

        delete user.password
        return user
    }

    signToken(user: UserModel): string {
        try {
            const payload = {
                sub: user.email,
            }

            return this.jwtService.sign(payload)
        } catch (error) {
            throw error
        }
    }
}
