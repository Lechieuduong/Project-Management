import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "src/modules/users/decorators/user-roles.decorator";
import { UsersRole } from "src/modules/users/users.constants";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requireRoles = this.reflector.getAllAndOverride<UsersRole[]>(
            ROLES_KEY,
            [context.getHandler(),
            context.getClass()],
        );
        if (!requireRoles)
            return true;

        const roleUser = context.switchToHttp().getRequest().user.role;

        if (requireRoles.includes(roleUser))
            return true;

        return false

    }
}