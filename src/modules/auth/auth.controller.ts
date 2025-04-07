import { Response } from "express"
import { Body, Controller, HttpCode, HttpStatus, Post, Res, UseGuards } from "@nestjs/common"
import { ApiOperation, ApiResponse } from "@nestjs/swagger"
import { UserModel } from "@models"

import { SignIn, SignUp } from "./dto"
import { LocalAuthGuard } from "./guards"
import { AuthService } from "./auth.service"
import { AuthUser } from "./user.decorator"

@Controller("auth")
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) { }

    @Post("register")
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: "Регистрация пользователя" })
    @ApiResponse({ status: 201, description: "Пользователь успешно создан", type: UserModel })
    async register(@Body() signUp: SignUp, @Res() res: Response): Promise<Response> {
        const user = await this.authService.register(signUp)
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

    @Post("login")
    @UseGuards(LocalAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Авторизация пользователя" })
    @ApiResponse({ status: 200, description: "Успешная авторизация", type: UserModel })
    @ApiResponse({ status: 401, description: 'Ошибка авторизации' })
    async login(@AuthUser() user: UserModel, @Body() signIn: SignIn, @Res() res: Response): Promise<Response<UserModel>> {
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
