import { Response } from "express"
import { Body, Controller, HttpCode, HttpStatus, Post, Res, UseGuards } from "@nestjs/common"
import { ApiOperation, ApiResponse } from "@nestjs/swagger"
import { UserModel } from "@models"

import { SignIn, SignUp } from "./dto"
import { LocalAuthGuard } from "./guards"
import { AuthService } from "./auth.service"
import { AuthUser } from "./user.decorator"
import { User } from "../users/dto"

@Controller("auth")
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) { }

    @Post("signup")
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: "Регистрация пользователя" })
    @ApiResponse({ status: 201, description: "Пользователь успешно создан", type: User })
    async signUp(@Body() signUp: SignUp, @Res() res: Response): Promise<Response<User>> {
        const user = await this.authService.signUp(signUp)
        const token = this.authService.signToken(user)

        res.setHeader("Authorization", `Bearer ${token}`)

        res.cookie("token", token, {
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            httpOnly: true,
            signed: true,
        })

        res.send(user)
        return res
    }

    @Post("signin")
    @UseGuards(LocalAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Авторизация пользователя" })
    @ApiResponse({ status: 200, description: "Успешная авторизация", type: User })
    @ApiResponse({ status: 401, description: 'Ошибка авторизации' })
    async signIn(@AuthUser() user: Omit<UserModel, 'password'>, @Body() signIn: SignIn, @Res() res: Response): Promise<Response<User>> {
        const token = this.authService.signToken(user)

        res.setHeader("Authorization", `Bearer ${token}`)

        res.cookie("token", token, {
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            httpOnly: true,
            signed: true,
        })

        res.send(user)
        return res
    }
}
