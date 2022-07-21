export enum CommonError {
    NOT_FOUND_USER = 'Not found user',

    NOT_VERIFY_EMAIL = 'You have to register or verified your account',
    NOT_FOUND_TASK = 'Task is not found',
    NOT_FOUND_SUBTASK = 'Sub-Task is not found',
    ONLY_ONE_USER = 'Only assign for 1 people',
    NOT_SUBTASK = 'This is not subtask',

    NOT_FOUND_PROJECT = 'Project is not found',
    EXISTS_MEMBER = 'This member already exists.',
    NOT_EXISTS_MEMBER = 'This member does not exists!'
}

export enum CommonSuccess {
    CREATED_PROJECT_SUCCESS = 'Create project successful',
    UPDATED_PROJECT_SUCCESS = 'Update Pproject successful',
    CHANGE_STATUS_PROJECT = 'Change status successfully',
    DELETE_PROJECT_SUCCESS = 'Delete project successful',
    ADD_MEMBERS = 'Add Member Successful',
    KICK_MEMBERS = 'Kick Member Successful',
    GET_ALL_MEMBERS = 'Get all members of project successful',
    GET_INFORMATION = 'Get information of project successful',

    CREATED_TASK_SUCCESS = 'Create task successful',
    CREATED_SUBTASK_SUCCESS = 'Create sub-task successful',
    UPDATED_TASK_SUCCESS = 'Update task successful',
    UPDATED_SUBTASK_SUCCESS = 'Update sub-task successful',
    DELETE_TASK_SUCCESS = 'Delete task successful',
    ASSIGN_USER_BUG = 'Assign successful but this task has bug',
    ASSIGN_USER = 'Assign successful',
    TASK_HAS_BUG = 'Your task has a bug'
}

export enum DefaultPagination {
    PAGE = 1,
    PAGE_SIZE = 10,
}

export const defaultNameLength = 30;

export const commonRadix = 10;
