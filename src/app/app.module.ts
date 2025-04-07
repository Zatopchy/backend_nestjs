import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { TypeOrmModule } from "@nestjs/typeorm"

import { UserModule, AuthModule } from "../modules"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import * as options from "./config"

require("dotenv").config()

@Module({
    controllers: [AppController],
    providers: [AppService],

    imports: [
        ConfigModule.forRoot(options.configs),
        TypeOrmModule.forRootAsync(options.postgres),
        UserModule,
        AuthModule
    ],

    exports: [
        ConfigModule,
    ]
})
export class AppModule {}
