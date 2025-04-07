import { IsDefined, IsString } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class AppInfo {
    @IsDefined()
    @IsString()
    @ApiProperty({ example: "0.0.1", description: "Версия приложения", required: true })
    version: string
}
