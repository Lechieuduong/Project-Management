export enum ProjectMessage {
    PROJECT_EXIST = 'Project already exists'
}

export enum ProjectStatus {
    TO_DO = 'To Do',
    IN_PROGRESS = 'In Progress',
    READY_FOR_TEST = 'Ready For Test',
    DONE = 'Done',
    CANCELLED = 'Cancelled',
    BUG = 'Bug'
}

export enum ProjectType {
    ODC = 'ODC', // Offshore Development Centre
    PB = 'PB' // Project-Based Contract
}