import { Injectable } from "@nestjs/common"

@Injectable()
export class AppService {
    info() {
        return {
            version: "0.0.1",
        }
    }
}
