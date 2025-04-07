import { ApiProperty } from "@nestjs/swagger"
import { IsDefined, IsNotEmpty, IsEmail, MinLength } from "class-validator"

export class SignUp {
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
