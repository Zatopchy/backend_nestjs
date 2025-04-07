import { ValidationPipe } from "@nestjs/common"

export function validationPipe() {
    return new ValidationPipe({
        forbidNonWhitelisted: true,
        whitelist: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    })
}
