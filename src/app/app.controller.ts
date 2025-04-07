import { Controller, Get } from "@nestjs/common"
import { AppService } from "./app.service"
import { ApiOperation, ApiResponse } from "@nestjs/swagger"
import { AppInfo } from "./dto"

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get("/")
    @ApiOperation({ summary: "Информация о приложении" })
    @ApiResponse({ status: 200, description: "Информация о приложении", type: AppInfo })
    root(): AppInfo {
        return this.appService.info()
    }
}
