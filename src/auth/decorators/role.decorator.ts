import { SetMetadata } from "@nestjs/common";
import { UsersRole } from "src/modules/users/users.constants";

export const Role_Key = 'roles';
export const Roles = (...roles: UsersRole[]) => SetMetadata(Role_Key, roles);