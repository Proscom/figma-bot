export declare class AuthorizationError extends Error {
    error: Error;
    name: string;
    constructor(error: Error | string);
}
export declare class FileCreationError extends Error {
    projectId: string;
    fileName?: string | undefined;
    error: Error;
    name: string;
    constructor(error: Error | string, projectId: string, fileName?: string | undefined);
}
export declare class FileRenameError extends Error {
    fileId: string;
    newName?: string | undefined;
    error: Error;
    name: string;
    constructor(error: Error | string, fileId: string, newName?: string | undefined);
}
export declare class ProjectCreationError extends Error {
    teamId: string;
    projectName?: string | undefined;
    error: Error;
    name: string;
    constructor(error: Error | string, teamId: string, projectName?: string | undefined);
}
export declare class ProjectRenameError extends Error {
    projectId: string;
    newName?: string | undefined;
    error: Error;
    name: string;
    constructor(error: Error | string, projectId: string, newName?: string | undefined);
}
export declare class DuplicateExternalFileError extends Error {
    projectId: string;
    fileName?: string | undefined;
    error: Error;
    name: string;
    constructor(error: Error | string, projectId: string, fileName?: string | undefined);
}
export declare class RenameFileInProjectError extends Error {
    projectId: string;
    fileName?: string | undefined;
    error: Error;
    name: string;
    constructor(error: Error | string, projectId: string, fileName?: string | undefined);
}
