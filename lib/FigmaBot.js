"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FigmaBot = void 0;
var puppeteer_1 = __importDefault(require("puppeteer"));
var errors_1 = require("./common/errors");
var functions_1 = require("./common/functions");
var figmaBot_common_actions_1 = require("./figmaBot.common.actions");
var FigmaBot = /** @class */ (function () {
    function FigmaBot(_a) {
        var authData = _a.authData, _b = _a.delayDuration, delayDuration = _b === void 0 ? 2000 : _b, cookiesProvider = _a.cookiesProvider;
        this.authData = authData;
        this.delayDuration = delayDuration;
        this.cookiesProvider = cookiesProvider;
    }
    FigmaBot.prototype._signIn = function (page, authData) {
        if (authData === void 0) { authData = this.authData; }
        return __awaiter(this, void 0, void 0, function () {
            var e_1, url, cookies, error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, figmaBot_common_actions_1.FigmaBotCommonActions.waitAndNavigate(page, page.goto('https://www.figma.com/login'))];
                    case 1:
                        _a.sent();
                        if (page.url().includes('https://www.figma.com/files/recent')) {
                            return [2 /*return*/];
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, figmaBot_common_actions_1.FigmaBotCommonActions.waitAndNavigate(page, figmaBot_common_actions_1.FigmaBotCommonActions.submitSingInForm(page, authData))];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        e_1 = _a.sent();
                        throw new errors_1.AuthorizationError(e_1);
                    case 5:
                        url = page.url();
                        if (!url.includes('https://www.figma.com/files/recent')) return [3 /*break*/, 9];
                        if (!this.cookiesProvider) return [3 /*break*/, 8];
                        return [4 /*yield*/, page.cookies()];
                    case 6:
                        cookies = _a.sent();
                        return [4 /*yield*/, this.cookiesProvider.setCookies(cookies)];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8: return [3 /*break*/, 12];
                    case 9:
                        if (!(url === 'https://www.figma.com/login')) return [3 /*break*/, 11];
                        return [4 /*yield*/, figmaBot_common_actions_1.FigmaBotCommonActions.parseLoginPageError(page)];
                    case 10:
                        error = _a.sent();
                        throw new errors_1.AuthorizationError(error || 'unknown error');
                    case 11: throw new errors_1.AuthorizationError("Unexpectedly redirected to \"" + url + "\"");
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    FigmaBot.prototype._confirmAuth = function (page, authData) {
        if (authData === void 0) { authData = this.authData; }
        return __awaiter(this, void 0, void 0, function () {
            var cookies, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, figmaBot_common_actions_1.FigmaBotCommonActions.checkAuth(page)];
                    case 1:
                        if (!!(_a.sent())) return [3 /*break*/, 11];
                        if (!!this.cookiesProvider) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._signIn(page, authData)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                    case 3:
                        _a.trys.push([3, 6, 7, 11]);
                        return [4 /*yield*/, this.cookiesProvider.getCookies()];
                    case 4:
                        cookies = _a.sent();
                        return [4 /*yield*/, page.setCookie.apply(page, cookies)];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 11];
                    case 6:
                        e_2 = _a.sent();
                        throw new errors_1.AuthorizationError(e_2);
                    case 7: return [4 /*yield*/, figmaBot_common_actions_1.FigmaBotCommonActions.checkAuth(page)];
                    case 8:
                        if (!!(_a.sent())) return [3 /*break*/, 10];
                        return [4 /*yield*/, this._signIn(page, authData)];
                    case 9:
                        _a.sent();
                        _a.label = 10;
                    case 10: return [7 /*endfinally*/];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    FigmaBot.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, puppeteer_1.default.launch({
                                defaultViewport: {
                                    width: 1920,
                                    height: 1080
                                }
                            })];
                    case 1:
                        _a.browser = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    FigmaBot.prototype.stop = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.browser.close()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    FigmaBot.prototype.createProject = function (projectName, teamId) {
        return __awaiter(this, void 0, void 0, function () {
            var page, newProjectButtonHandle, createProjectButtonHandle, e_3, newProjectPageURLRegExp, url, projectId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!projectName) {
                            throw new errors_1.ProjectCreationError('Parameter "projectName" must be a non-empty string', teamId);
                        }
                        return [4 /*yield*/, this.browser.newPage()];
                    case 1:
                        page = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 16, , 18]);
                        return [4 /*yield*/, this._confirmAuth(page)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, figmaBot_common_actions_1.FigmaBotCommonActions.goToTeamPage(page, teamId)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, figmaBot_common_actions_1.FigmaBotCommonActions.findElement(page, {
                                selector: '[data-onboarding-key*="new-project"]'
                            })];
                    case 5:
                        newProjectButtonHandle = _a.sent();
                        return [4 /*yield*/, functions_1.wait(this.delayDuration)];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, figmaBot_common_actions_1.FigmaBotCommonActions.click(page, newProjectButtonHandle)];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, page.waitForSelector('[class*="new_folder_modal"]')];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, functions_1.wait(this.delayDuration)];
                    case 9:
                        _a.sent();
                        return [4 /*yield*/, page.click('[class*="new_folder_modal"] > input')];
                    case 10:
                        _a.sent();
                        return [4 /*yield*/, functions_1.wait(this.delayDuration)];
                    case 11:
                        _a.sent();
                        return [4 /*yield*/, page.keyboard.type(projectName, { delay: 200 })];
                    case 12:
                        _a.sent();
                        return [4 /*yield*/, figmaBot_common_actions_1.FigmaBotCommonActions.findElement(page, {
                                selector: '[class*="basic_form--primaryBtn"]',
                                innerHTML: 'Create project'
                            })];
                    case 13:
                        createProjectButtonHandle = _a.sent();
                        return [4 /*yield*/, functions_1.wait(this.delayDuration)];
                    case 14:
                        _a.sent();
                        return [4 /*yield*/, figmaBot_common_actions_1.FigmaBotCommonActions.waitAndNavigate(page, figmaBot_common_actions_1.FigmaBotCommonActions.click(page, createProjectButtonHandle))];
                    case 15:
                        _a.sent();
                        return [3 /*break*/, 18];
                    case 16:
                        e_3 = _a.sent();
                        return [4 /*yield*/, page.close()];
                    case 17:
                        _a.sent();
                        throw new errors_1.ProjectCreationError(e_3, teamId, projectName);
                    case 18:
                        newProjectPageURLRegExp = /^https:\/\/www.figma.com\/files\/project\/[\d]{8}[\/$].*/;
                        url = page.url();
                        if (!!newProjectPageURLRegExp.test(url)) return [3 /*break*/, 20];
                        return [4 /*yield*/, page.close()];
                    case 19:
                        _a.sent();
                        throw new errors_1.ProjectCreationError("Unexpectedly redirected to \"" + url + "\". Note that project still could be created.", teamId, projectName);
                    case 20:
                        projectId = url.split('/')[5];
                        return [4 /*yield*/, page.close()];
                    case 21:
                        _a.sent();
                        return [2 /*return*/, projectId];
                }
            });
        });
    };
    FigmaBot.prototype.createFile = function (fileName, projectId) {
        return __awaiter(this, void 0, void 0, function () {
            var newFilePageURLRegExp, page, newFileButtonHandle, e_4, url, fileId, e_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!fileName) {
                            throw new errors_1.FileCreationError('Parameter "fileName" must be a non-empty string', projectId);
                        }
                        newFilePageURLRegExp = /^https:\/\/www.figma.com\/file\/[\d\w]{22}[\/$].*/;
                        return [4 /*yield*/, this.browser.newPage()];
                    case 1:
                        page = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 8, , 10]);
                        return [4 /*yield*/, this._confirmAuth(page)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, figmaBot_common_actions_1.FigmaBotCommonActions.goToProjectPage(page, projectId)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, figmaBot_common_actions_1.FigmaBotCommonActions.findElement(page, {
                                selector: '[class*="newDesignFileButton"]'
                            })];
                    case 5:
                        newFileButtonHandle = _a.sent();
                        return [4 /*yield*/, functions_1.wait(this.delayDuration)];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, figmaBot_common_actions_1.FigmaBotCommonActions.click(page, newFileButtonHandle)];
                    case 7:
                        _a.sent();
                        return [3 /*break*/, 10];
                    case 8:
                        e_4 = _a.sent();
                        return [4 /*yield*/, page.close()];
                    case 9:
                        _a.sent();
                        throw new errors_1.FileCreationError(e_4, projectId, fileName);
                    case 10: return [4 /*yield*/, figmaBot_common_actions_1.FigmaBotCommonActions.waitForRedirects({ page: page })];
                    case 11:
                        _a.sent();
                        url = page.url();
                        if (!!newFilePageURLRegExp.test(url)) return [3 /*break*/, 13];
                        return [4 /*yield*/, page.close()];
                    case 12:
                        _a.sent();
                        throw new errors_1.FileCreationError("Unexpectedly redirected to \"" + url + "\". Note that file still could be created, but named \"Untitled\"", projectId, fileName);
                    case 13:
                        fileId = url.split('/')[4];
                        _a.label = 14;
                    case 14:
                        _a.trys.push([14, 16, 17, 19]);
                        return [4 /*yield*/, this.renameFile(fileId, fileName)];
                    case 15:
                        _a.sent();
                        return [3 /*break*/, 19];
                    case 16:
                        e_5 = _a.sent();
                        throw e_5;
                    case 17: return [4 /*yield*/, page.close()];
                    case 18:
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 19: return [2 /*return*/, fileId];
                }
            });
        });
    };
    FigmaBot.prototype.renameFile = function (fileId, newName) {
        return __awaiter(this, void 0, void 0, function () {
            var page, e_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.browser.newPage()];
                    case 1:
                        page = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 14, 15, 17]);
                        return [4 /*yield*/, this._confirmAuth(page)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, figmaBot_common_actions_1.FigmaBotCommonActions.goToFilePage(page, fileId)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, figmaBot_common_actions_1.FigmaBotCommonActions.waitForRedirects({ page: page })];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, page.waitForSelector('[class*="filename_view--title"]')];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, functions_1.wait(this.delayDuration)];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, page.click('[class*="filename_view--title"]')];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, functions_1.wait(this.delayDuration)];
                    case 9:
                        _a.sent();
                        return [4 /*yield*/, page.keyboard.type(newName, { delay: 200 })];
                    case 10:
                        _a.sent();
                        return [4 /*yield*/, functions_1.wait(this.delayDuration)];
                    case 11:
                        _a.sent();
                        return [4 /*yield*/, page.keyboard.press('Enter', { delay: 70 })];
                    case 12:
                        _a.sent();
                        return [4 /*yield*/, functions_1.wait(this.delayDuration)];
                    case 13:
                        _a.sent();
                        return [3 /*break*/, 17];
                    case 14:
                        e_6 = _a.sent();
                        throw new errors_1.FileRenameError(e_6, fileId, newName);
                    case 15: return [4 /*yield*/, page.close()];
                    case 16:
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 17: return [2 /*return*/];
                }
            });
        });
    };
    // TO-DO - check capability
    FigmaBot.prototype.renameProject = function (projectId, newName) {
        return __awaiter(this, void 0, void 0, function () {
            var page, projectOptionsHandle, renameButtonHandle, input, e_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.browser.newPage()];
                    case 1:
                        page = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 20, 21, 23]);
                        return [4 /*yield*/, this._confirmAuth(page)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, figmaBot_common_actions_1.FigmaBotCommonActions.goToProjectPage(page, projectId)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, functions_1.wait(this.delayDuration)];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, figmaBot_common_actions_1.FigmaBotCommonActions.findElement(page, {
                                selector: '[class*="page_header"] [class*="basic_form--btn"]:last-child'
                            })];
                    case 6:
                        projectOptionsHandle = _a.sent();
                        return [4 /*yield*/, functions_1.wait(this.delayDuration)];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, figmaBot_common_actions_1.FigmaBotCommonActions.click(page, projectOptionsHandle)];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, figmaBot_common_actions_1.FigmaBotCommonActions.findElement(page, {
                                selector: '[class*="dropdown--_optionBase"]',
                                innerHTML: 'Rename'
                            })];
                    case 9:
                        renameButtonHandle = _a.sent();
                        return [4 /*yield*/, functions_1.wait(this.delayDuration)];
                    case 10:
                        _a.sent();
                        return [4 /*yield*/, figmaBot_common_actions_1.FigmaBotCommonActions.click(page, renameButtonHandle)];
                    case 11:
                        _a.sent();
                        return [4 /*yield*/, figmaBot_common_actions_1.FigmaBotCommonActions.findElement(page, {
                                selector: 'input[class*="resource_rename_modal"]'
                            })];
                    case 12:
                        input = _a.sent();
                        return [4 /*yield*/, functions_1.wait(this.delayDuration)];
                    case 13:
                        _a.sent();
                        return [4 /*yield*/, figmaBot_common_actions_1.FigmaBotCommonActions.clearInput(page, input)];
                    case 14:
                        _a.sent();
                        return [4 /*yield*/, functions_1.wait(this.delayDuration)];
                    case 15:
                        _a.sent();
                        return [4 /*yield*/, input.type(newName, { delay: 200 })];
                    case 16:
                        _a.sent();
                        return [4 /*yield*/, functions_1.wait(this.delayDuration)];
                    case 17:
                        _a.sent();
                        return [4 /*yield*/, page.keyboard.press('Enter', { delay: 70 })];
                    case 18:
                        _a.sent();
                        return [4 /*yield*/, functions_1.wait(this.delayDuration)];
                    case 19:
                        _a.sent();
                        return [3 /*break*/, 23];
                    case 20:
                        e_7 = _a.sent();
                        throw new errors_1.ProjectRenameError(e_7, projectId, newName);
                    case 21: return [4 /*yield*/, page.close()];
                    case 22:
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 23: return [2 /*return*/];
                }
            });
        });
    };
    // TO-DO - check capability
    /**
     * Copying [sourceFileName] from project [sourceProjectId] to [destinationProjectName]
     */
    FigmaBot.prototype.duplicateFileFromExternalProject = function (sourceProjectId, sourceFileName, destinationProjectName) {
        return __awaiter(this, void 0, void 0, function () {
            var page, sourceFileButtonHandle, duplicateFileButtonHandle, copyFileButtonHandle, moveCopyFileButtonHandle, input, destinationProjectInModal, moveCopyFileInModalButtonHandle, e_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.browser.newPage()];
                    case 1:
                        page = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 41, 42, 44]);
                        return [4 /*yield*/, this._confirmAuth(page)];
                    case 3:
                        _a.sent();
                        // open project page [sourceProjectId]
                        return [4 /*yield*/, figmaBot_common_actions_1.FigmaBotCommonActions.goToProjectPage(page, sourceProjectId)];
                    case 4:
                        // open project page [sourceProjectId]
                        _a.sent();
                        return [4 /*yield*/, functions_1.wait(this.delayDuration)];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, figmaBot_common_actions_1.FigmaBotCommonActions.findElement(page, {
                                selector: '[class*="generic_tile--title"]',
                                innerHTML: sourceFileName
                            })];
                    case 6:
                        sourceFileButtonHandle = _a.sent();
                        return [4 /*yield*/, functions_1.wait(this.delayDuration)];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, figmaBot_common_actions_1.FigmaBotCommonActions.click(page, sourceFileButtonHandle, 'right')];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, functions_1.wait(this.delayDuration)];
                    case 9:
                        _a.sent();
                        return [4 /*yield*/, figmaBot_common_actions_1.FigmaBotCommonActions.findElement(page, {
                                selector: '*',
                                innerHTML: 'Duplicate'
                            })];
                    case 10:
                        duplicateFileButtonHandle = _a.sent();
                        return [4 /*yield*/, functions_1.wait(this.delayDuration)];
                    case 11:
                        _a.sent();
                        return [4 /*yield*/, functions_1.wait(this.delayDuration)];
                    case 12:
                        _a.sent();
                        return [4 /*yield*/, figmaBot_common_actions_1.FigmaBotCommonActions.click(page, duplicateFileButtonHandle)];
                    case 13:
                        _a.sent();
                        return [4 /*yield*/, functions_1.wait(this.delayDuration)];
                    case 14:
                        _a.sent();
                        return [4 /*yield*/, functions_1.wait(this.delayDuration)];
                    case 15:
                        _a.sent();
                        return [4 /*yield*/, functions_1.wait(this.delayDuration)];
                    case 16:
                        _a.sent();
                        return [4 /*yield*/, figmaBot_common_actions_1.FigmaBotCommonActions.findElement(page, {
                                selector: '[class*="generic_tile--title"]',
                                innerHTML: sourceFileName + ' (Copy)'
                            })];
                    case 17:
                        copyFileButtonHandle = _a.sent();
                        return [4 /*yield*/, functions_1.wait(this.delayDuration)];
                    case 18:
                        _a.sent();
                        return [4 /*yield*/, figmaBot_common_actions_1.FigmaBotCommonActions.click(page, copyFileButtonHandle, 'right')];
                    case 19:
                        _a.sent();
                        return [4 /*yield*/, functions_1.wait(this.delayDuration)];
                    case 20:
                        _a.sent();
                        return [4 /*yield*/, figmaBot_common_actions_1.FigmaBotCommonActions.findElement(page, {
                                selector: '*',
                                innerHTML: 'Move file...'
                            })];
                    case 21:
                        moveCopyFileButtonHandle = _a.sent();
                        return [4 /*yield*/, functions_1.wait(this.delayDuration)];
                    case 22:
                        _a.sent();
                        return [4 /*yield*/, functions_1.wait(this.delayDuration)];
                    case 23:
                        _a.sent();
                        return [4 /*yield*/, figmaBot_common_actions_1.FigmaBotCommonActions.click(page, moveCopyFileButtonHandle)];
                    case 24:
                        _a.sent();
                        return [4 /*yield*/, functions_1.wait(this.delayDuration)];
                    case 25:
                        _a.sent();
                        // in modal - input [destinationProjectName]
                        return [4 /*yield*/, functions_1.wait(this.delayDuration)];
                    case 26:
                        // in modal - input [destinationProjectName]
                        _a.sent();
                        return [4 /*yield*/, figmaBot_common_actions_1.FigmaBotCommonActions.findElement(page, {
                                selector: 'input[class*="file_move"]'
                            })];
                    case 27:
                        input = _a.sent();
                        return [4 /*yield*/, input.type(destinationProjectName, { delay: 200 })];
                    case 28:
                        _a.sent();
                        return [4 /*yield*/, functions_1.wait(this.delayDuration)];
                    case 29:
                        _a.sent();
                        // navigate to [destinationProjectName] in projects list and press mouse left-button - confirm destination project
                        return [4 /*yield*/, functions_1.wait(this.delayDuration)];
                    case 30:
                        // navigate to [destinationProjectName] in projects list and press mouse left-button - confirm destination project
                        _a.sent();
                        return [4 /*yield*/, figmaBot_common_actions_1.FigmaBotCommonActions.findElement(page, {
                                selector: '[class*="file_move--folderName"]',
                                innerHTML: destinationProjectName
                            })];
                    case 31:
                        destinationProjectInModal = _a.sent();
                        return [4 /*yield*/, functions_1.wait(this.delayDuration)];
                    case 32:
                        _a.sent();
                        return [4 /*yield*/, figmaBot_common_actions_1.FigmaBotCommonActions.click(page, destinationProjectInModal)];
                    case 33:
                        _a.sent();
                        return [4 /*yield*/, functions_1.wait(this.delayDuration)];
                    case 34:
                        _a.sent();
                        return [4 /*yield*/, figmaBot_common_actions_1.FigmaBotCommonActions.findElement(page, {
                                selector: '[class*="basic_form--primaryBtn"]',
                                innerHTML: 'Move'
                            })];
                    case 35:
                        moveCopyFileInModalButtonHandle = _a.sent();
                        return [4 /*yield*/, functions_1.wait(this.delayDuration)];
                    case 36:
                        _a.sent();
                        return [4 /*yield*/, functions_1.wait(this.delayDuration)];
                    case 37:
                        _a.sent();
                        return [4 /*yield*/, figmaBot_common_actions_1.FigmaBotCommonActions.click(page, moveCopyFileInModalButtonHandle)];
                    case 38:
                        _a.sent();
                        return [4 /*yield*/, functions_1.wait(this.delayDuration)];
                    case 39:
                        _a.sent();
                        return [4 /*yield*/, functions_1.wait(this.delayDuration)];
                    case 40:
                        _a.sent();
                        return [3 /*break*/, 44];
                    case 41:
                        e_8 = _a.sent();
                        throw new errors_1.DuplicateExternalFileError(e_8, sourceProjectId, sourceFileName);
                    case 42: return [4 /*yield*/, page.close()];
                    case 43:
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 44: return [2 /*return*/];
                }
            });
        });
    };
    // TO-DO - check capability
    /**
     * Rename file [sourceFileName] to [newFileName] in project [sourceProjectId]
     */
    FigmaBot.prototype.renameFileInProject = function (sourceProjectId, sourceFileName, newFileName) {
        return __awaiter(this, void 0, void 0, function () {
            var page, sourceFileButtonHandle, renameFileButtonHandle, e_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.browser.newPage()];
                    case 1:
                        page = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 20, 21, 23]);
                        return [4 /*yield*/, this._confirmAuth(page)];
                    case 3:
                        _a.sent();
                        // open project page [sourceProjectId]
                        return [4 /*yield*/, figmaBot_common_actions_1.FigmaBotCommonActions.goToProjectPage(page, sourceProjectId)];
                    case 4:
                        // open project page [sourceProjectId]
                        _a.sent();
                        return [4 /*yield*/, functions_1.wait(this.delayDuration)];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, figmaBot_common_actions_1.FigmaBotCommonActions.findElement(page, {
                                selector: '[class*="generic_tile--title"]',
                                innerHTML: sourceFileName
                            })];
                    case 6:
                        sourceFileButtonHandle = _a.sent();
                        return [4 /*yield*/, functions_1.wait(this.delayDuration)];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, figmaBot_common_actions_1.FigmaBotCommonActions.click(page, sourceFileButtonHandle, 'right')];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, functions_1.wait(this.delayDuration)];
                    case 9:
                        _a.sent();
                        return [4 /*yield*/, figmaBot_common_actions_1.FigmaBotCommonActions.findElement(page, {
                                selector: '*',
                                innerHTML: 'Rename'
                            })];
                    case 10:
                        renameFileButtonHandle = _a.sent();
                        return [4 /*yield*/, functions_1.wait(this.delayDuration)];
                    case 11:
                        _a.sent();
                        return [4 /*yield*/, functions_1.wait(this.delayDuration)];
                    case 12:
                        _a.sent();
                        return [4 /*yield*/, figmaBot_common_actions_1.FigmaBotCommonActions.click(page, renameFileButtonHandle)];
                    case 13:
                        _a.sent();
                        return [4 /*yield*/, functions_1.wait(this.delayDuration)];
                    case 14:
                        _a.sent();
                        // from keyboard - type [newFileName] and press "Enter"
                        return [4 /*yield*/, functions_1.wait(this.delayDuration)];
                    case 15:
                        // from keyboard - type [newFileName] and press "Enter"
                        _a.sent();
                        return [4 /*yield*/, page.keyboard.type(newFileName, { delay: 200 })];
                    case 16:
                        _a.sent();
                        return [4 /*yield*/, functions_1.wait(this.delayDuration)];
                    case 17:
                        _a.sent();
                        return [4 /*yield*/, page.keyboard.press('Enter', { delay: 70 })];
                    case 18:
                        _a.sent();
                        return [4 /*yield*/, functions_1.wait(this.delayDuration)];
                    case 19:
                        _a.sent();
                        return [3 /*break*/, 23];
                    case 20:
                        e_9 = _a.sent();
                        throw new errors_1.RenameFileInProjectError(e_9, sourceProjectId, sourceFileName);
                    case 21: return [4 /*yield*/, page.close()];
                    case 22:
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 23: return [2 /*return*/];
                }
            });
        });
    };
    return FigmaBot;
}());
exports.FigmaBot = FigmaBot;
//# sourceMappingURL=FigmaBot.js.map