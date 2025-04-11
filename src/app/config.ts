import * as path from "path"
import * as Joi from "joi"
import { Algorithm } from "jsonwebtoken"
import { ConfigModule, ConfigModuleOptions, ConfigService } from "@nestjs/config"
import { JwtModuleAsyncOptions } from "@nestjs/jwt"
import { TypeOrmModuleAsyncOptions } from "@nestjs/typeorm"

const schema = Joi.object({
    POSTGRES_HOST: Joi.string().default('localhost'),
    POSTGRES_PORT: Joi.number().default(5432),
    POSTGRES_USER: Joi.string().required(),
    POSTGRES_PASSWORD: Joi.string().required(),
    POSTGRES_DB: Joi.string().required(),
})

export const configs: ConfigModuleOptions = {
    validationSchema: schema,
    isGlobal: true,

    validationOptions: {
        allowUnknown: true,
        abortEarly: true,
    },
}

export const postgres: TypeOrmModuleAsyncOptions = {
    imports: [ConfigModule],
    inject: [ConfigService],

    useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: configService.get('POSTGRES_PORT'),
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DB'),
        entities: [path.join(__dirname, '../**/*.entity{.ts,.js}')],
        synchronize: true,
    }),
}

export const jwtConfig = {
    verifyOptions: {
        algorithms: ["HS384" as Algorithm],
    },

    signOptions: {
        expiresIn: "1y",
        algorithm: "HS384" as Algorithm,
    },
}

export const jwtStrategy: JwtModuleAsyncOptions = {
    imports: [ConfigModule],
    inject: [ConfigService],

    useFactory: async (configService: ConfigService) =>
        ({
            secret: configService.get("SESSION_SECRET"),
            ...jwtConfig,
        }),
}
