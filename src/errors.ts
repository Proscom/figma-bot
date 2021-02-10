export class ProjectCreationError extends Error {
  constructor(
    public errorMessage: string,
    public teamId: string,
    public projectName?: string
  ) {
    super(
      `Project ${
        projectName && `"${projectName}"`
      } creation in team with id "${teamId}" failed with error: ${errorMessage}`
    );
  }
}
export class FileCreationError extends Error {
  constructor(
    public errorMessage: string,
    public projectId: string,
    public fileName?: string
  ) {
    super(
      `File ${
        fileName && `"${fileName}"`
      } creation in project with id "${projectId}" failed with error: ${errorMessage}`
    );
  }
}
