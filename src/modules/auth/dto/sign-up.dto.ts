import { IsDefined, IsNotEmpty, IsEmail, MinLength } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { UserModel } from "@models"

export class SignUp implements Pick<UserModel, 'email' | 'password'> {
    @IsDefined()
    @IsEmail()
    @ApiProperty({ example: "hello@example.com", description: "Email пользователя", required: true })
    email: string

    @IsDefined()
    @IsNotEmpty()
    @MinLength(6)
    @ApiProperty({ example: "qwerty123", description: "Пароль пользователя", required: true })
    password: string
}
