import { compare as bcryptCompare } from 'bcrypt';
import { Injectable, UnauthorizedException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { UserModel } from "@models"

import { JwtPayload } from './types/jwt-payload';
import { UsersService } from "../users/users.service"

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async signUp(signUp: Pick<UserModel, 'email' | 'password'>): Promise<Omit<UserModel, 'password'>> {
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

    async signIn(signIn: Pick<UserModel, 'email' | 'password'>): Promise<UserModel> {
        let user = await this.usersService.findOne(signIn.email)

        if (!user || !(await bcryptCompare(signIn.password, user.password))) {
            throw new UnauthorizedException(`Неверный email или пароль`)
        }

        return user
    }

    async verifyPayload(payload: JwtPayload): Promise<Omit<UserModel, 'password'>> {
        let user: UserModel

        try {
            user = await this.usersService.findOne(payload.sub)
        } catch (error) {
            throw new UnauthorizedException(`Пользователь не найден: ${payload.sub}`)
        }

        delete user.password
        return user
    }

    signToken(user: Pick<UserModel, 'email'>): string {
        try {
            return this.jwtService.sign({
                sub: user.email,
            })
        } catch (error) {
            throw error
        }
    }
}
