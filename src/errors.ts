export class AuthorizationError extends Error {
  error: Error;
  name = 'AuthorizationError';
  constructor(error: Error | string) {
    super(
      `Authorization failed | ${
        typeof error === 'string' ? error : error.message
      }`
    );
    this.error = typeof error === 'string' ? new Error(error) : error;
  }
}
export class ProjectCreationError extends Error {
  error: Error;
  name = 'ProjectCreationError';
  constructor(
    error: Error | string,
    public teamId: string,
    public projectName?: string
  ) {
    super(
      `Project ${
        projectName && `"${projectName}"`
      } creation in team with id "${teamId}" failed | ${
        typeof error === 'string' ? error : error.message
      }`
    );
    this.error = typeof error === 'string' ? new Error(error) : error;
  }
}
export class FileCreationError extends Error {
  error: Error;
  name = 'FileCreationError';
  constructor(
    error: Error | string,
    public projectId: string,
    public fileName?: string
  ) {
    super(
      `File ${
        fileName && `"${fileName}"`
      } creation in project with id "${projectId}" failed | ${
        typeof error === 'string' ? error : error.message
      }`
    );
    this.error = typeof error === 'string' ? new Error(error) : error;
  }
}
export class FileRenameError extends Error {
  error: Error;
  name = 'FileRenameError';
  constructor(
    error: Error | string,
    public fileId: string,
    public newName?: string
  ) {
    super(
      `File with id "${fileId}" rename to "${newName}" failed | ${
        typeof error === 'string' ? error : error.message
      }`
    );
    this.error = typeof error === 'string' ? new Error(error) : error;
  }
}
export class ProjectRenameError extends Error {
  error: Error;
  name = 'ProjectRenameError';
  constructor(
    error: Error | string,
    public projectId: string,
    public newName?: string
  ) {
    super(
      `Project with id "${projectId}" rename to "${newName}" failed | ${
        typeof error === 'string' ? error : error.message
      }`
    );
    this.error = typeof error === 'string' ? new Error(error) : error;
  }
}
