import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "src/modules/users/decorators/user-roles.decorator";
import { UsersRole } from "src/modules/users/users.constants";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requireRoles = this.reflector.getAllAndOverride<UsersRole[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );
        if (!requireRoles) {
            return true;
        }
        const { user } = context.switchToHttp().getRequest();
        return requireRoles.includes(user.role);
    }
}