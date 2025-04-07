import { UserModel } from "@models"
import { createParamDecorator, ExecutionContext } from "@nestjs/common"
import { Request } from "express"

interface RequestWithUser extends Request {
    user: UserModel;
  }

export const AuthUser = createParamDecorator((data: keyof UserModel, ctx: ExecutionContext) => {
    const user = ctx.switchToHttp().getRequest<RequestWithUser>().user as UserModel
    return data ? user && user[data] : user
})
