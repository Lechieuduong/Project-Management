import { SetMetadata } from "@nestjs/common";
import { UsersRole } from "src/modules/users/users.constants";

export const Role_Key = process.env.KEY_ROLE;
export const Roles = (...role: UsersRole[]) => SetMetadata(Role_Key, role);