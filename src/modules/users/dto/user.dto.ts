import { IsDefined, IsString, IsEmail } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { UserModel } from "@models"

export class User implements Pick<UserModel, 'uuid' | 'email'> {
    @IsDefined()
    @IsString()
    @ApiProperty({ example: "47e8ad22-5b2b-43b4-88bd-7e522822c2c1", description: "UUID пользователя", required: true })
    uuid: string

    @IsDefined()
    @IsEmail()
    @ApiProperty({ example: "hello@example.com", description: "Email пользователя", required: true })
    email: string
}
