export enum UserMesssage {
    NOT_FOUND_MAIL = 'No user with given email.',
    EMAIL_EXIST = 'Email already exists',
}

export enum UsersSummry {
    GET_BY_ID = 'Get user by ID.',
    UPDATE_BY_ID = 'Update user by ID.',
    GET_ALL = 'Get all users.',
    CREAT_USER = 'Creat an user.',
    DELETE_USER = 'Delete an user.',
}

export enum UsersRole {
    SUPERADMIN = 'Super Admin',
    ADMIN = 'Admin',
    USER = 'User'
}