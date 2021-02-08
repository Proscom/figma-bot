export class ProjectCreationError extends Error {
  constructor(errorMessage, teamId, projectName?) {
    super(
      `Project ${
        projectName && `"${projectName}"`
      } creation in team with id "${teamId}" failed with error: ${errorMessage}`
    );
  }
}
export class FileCreationError extends Error {
  constructor(errorMessage, projectId, fileName?) {
    super(
      `File ${
        fileName && `"${fileName}"`
      } creation in project with id "${projectId}" failed with error: ${errorMessage}`
    );
  }
}
