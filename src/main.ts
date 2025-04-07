import { NestFactory, Reflector } from "@nestjs/core"
import { ClassSerializerInterceptor } from "@nestjs/common"
import { NestExpressApplication } from "@nestjs/platform-express"
import { ConfigService } from "@nestjs/config"
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger"
import { useContainer } from "class-validator"
import * as cookieParser from "cookie-parser"
import * as session from "express-session"
import * as passport from "passport"
import * as dotenv from "dotenv"
import * as path from "path"
import * as fs from "fs"

dotenv.config({ path: ".env" })

import { validationPipe } from "./utils/validation/validation"
import { AppModule } from "./app"

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule)

    app.setGlobalPrefix("/")

    // Validators
    useContainer(app.select(AppModule), { fallbackOnErrors: true })
    app.useGlobalPipes(validationPipe())

    // Auth
    app.use(cookieParser(process.env.SESSION_SECRET))

    app.use(
        session({
            secret: process.env.SESSION_SECRET as string,
            store: new session.MemoryStore(),
            saveUninitialized: false,
            resave: false,

            cookie: {
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                httpOnly: true,
                signed: true,
            },
        }),
    )

    app.use(passport.initialize())

    app.enableCors({
        origin: process.env.ALLOWED_ORIGINS?.split(/\s*,\s*/) ?? "*",
        exposedHeaders: ["Authorization"],
        credentials: true,
    })

    // Docs
    const config = new DocumentBuilder()
        .setTitle("Backend")
        .setDescription("API of Backend")
        .addBearerAuth(
            {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
              name: 'JWT',
              description: 'Enter JWT token',
              in: 'header',
            },
            'token',
          )
        .setVersion("1.0")
        .build()

    const document = SwaggerModule.createDocument(app, config)

    SwaggerModule.setup("/docs/swagger", app, document, {
        customCss: fs.readFileSync(path.join(__dirname, "../assets/swagger/theme.css"), { encoding: "utf-8" }),
        customSiteTitle: "Backend API",
    })

    const configService = app.get(ConfigService)
    const port = configService.get("PORT")
    await app.listen(port)
}

bootstrap()
