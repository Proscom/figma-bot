"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenameFileInProjectError = exports.DuplicateExternalFileError = exports.ProjectRenameError = exports.ProjectCreationError = exports.FileRenameError = exports.FileCreationError = exports.AuthorizationError = void 0;
var AuthorizationError = /** @class */ (function (_super) {
    __extends(AuthorizationError, _super);
    function AuthorizationError(error) {
        var _this = _super.call(this, "Authorization failed | " + (typeof error === 'string' ? error : error.message)) || this;
        _this.name = 'AuthorizationError';
        _this.error = typeof error === 'string' ? new Error(error) : error;
        return _this;
    }
    return AuthorizationError;
}(Error));
exports.AuthorizationError = AuthorizationError;
var FileCreationError = /** @class */ (function (_super) {
    __extends(FileCreationError, _super);
    function FileCreationError(error, projectId, fileName) {
        var _this = _super.call(this, "File " + (fileName && "\"" + fileName + "\"") + " creation in project with id \"" + projectId + "\" failed | " + (typeof error === 'string' ? error : error.message)) || this;
        _this.projectId = projectId;
        _this.fileName = fileName;
        _this.name = 'FileCreationError';
        _this.error = typeof error === 'string' ? new Error(error) : error;
        return _this;
    }
    return FileCreationError;
}(Error));
exports.FileCreationError = FileCreationError;
var FileRenameError = /** @class */ (function (_super) {
    __extends(FileRenameError, _super);
    function FileRenameError(error, fileId, newName) {
        var _this = _super.call(this, "File with id \"" + fileId + "\" rename to \"" + newName + "\" failed | " + (typeof error === 'string' ? error : error.message)) || this;
        _this.fileId = fileId;
        _this.newName = newName;
        _this.name = 'FileRenameError';
        _this.error = typeof error === 'string' ? new Error(error) : error;
        return _this;
    }
    return FileRenameError;
}(Error));
exports.FileRenameError = FileRenameError;
var ProjectCreationError = /** @class */ (function (_super) {
    __extends(ProjectCreationError, _super);
    function ProjectCreationError(error, teamId, projectName) {
        var _this = _super.call(this, "Project " + (projectName && "\"" + projectName + "\"") + " creation in team with id \"" + teamId + "\" failed | " + (typeof error === 'string' ? error : error.message)) || this;
        _this.teamId = teamId;
        _this.projectName = projectName;
        _this.name = 'ProjectCreationError';
        _this.error = typeof error === 'string' ? new Error(error) : error;
        return _this;
    }
    return ProjectCreationError;
}(Error));
exports.ProjectCreationError = ProjectCreationError;
var ProjectRenameError = /** @class */ (function (_super) {
    __extends(ProjectRenameError, _super);
    function ProjectRenameError(error, projectId, newName) {
        var _this = _super.call(this, "Project with id \"" + projectId + "\" rename to \"" + newName + "\" failed | " + (typeof error === 'string' ? error : error.message)) || this;
        _this.projectId = projectId;
        _this.newName = newName;
        _this.name = 'ProjectRenameError';
        _this.error = typeof error === 'string' ? new Error(error) : error;
        return _this;
    }
    return ProjectRenameError;
}(Error));
exports.ProjectRenameError = ProjectRenameError;
var DuplicateExternalFileError = /** @class */ (function (_super) {
    __extends(DuplicateExternalFileError, _super);
    function DuplicateExternalFileError(error, projectId, fileName) {
        var _this = _super.call(this, "Duplicating " + fileName + " from project " + projectId + " failed | " + (typeof error === 'string' ? error : error.message)) || this;
        _this.projectId = projectId;
        _this.fileName = fileName;
        _this.name = 'ProjectRenameError';
        _this.error = typeof error === 'string' ? new Error(error) : error;
        return _this;
    }
    return DuplicateExternalFileError;
}(Error));
exports.DuplicateExternalFileError = DuplicateExternalFileError;
var RenameFileInProjectError = /** @class */ (function (_super) {
    __extends(RenameFileInProjectError, _super);
    function RenameFileInProjectError(error, projectId, fileName) {
        var _this = _super.call(this, "Renaming " + fileName + " in project " + projectId + " failed | " + (typeof error === 'string' ? error : error.message)) || this;
        _this.projectId = projectId;
        _this.fileName = fileName;
        _this.name = 'ProjectRenameError';
        _this.error = typeof error === 'string' ? new Error(error) : error;
        return _this;
    }
    return RenameFileInProjectError;
}(Error));
exports.RenameFileInProjectError = RenameFileInProjectError;
//# sourceMappingURL=errors.js.map