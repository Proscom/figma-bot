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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FigmaBotCommonActions = void 0;
var functions_1 = require("./common/functions");
var FigmaBotCommonActions = /** @class */ (function () {
    function FigmaBotCommonActions() {
    }
    FigmaBotCommonActions.waitAndNavigate = function (page, promise) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all([page.waitForNavigation(), promise])];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    FigmaBotCommonActions.waitForRedirects = function (_a) {
        var page = _a.page, _b = _a.redirectsLimit, redirectsLimit = _b === void 0 ? 10 : _b, _c = _a.timeout, timeout = _c === void 0 ? 7000 : _c;
        return __awaiter(this, void 0, void 0, function () {
            var i, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 5, , 6]);
                        i = 0;
                        _e.label = 1;
                    case 1:
                        if (!(i < redirectsLimit)) return [3 /*break*/, 4];
                        return [4 /*yield*/, page.waitForNavigation({ timeout: timeout })];
                    case 2:
                        _e.sent();
                        _e.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        _d = _e.sent();
                        return [2 /*return*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    FigmaBotCommonActions.findElement = function (page, _a) {
        var selector = _a.selector, innerHTML = _a.innerHTML;
        return __awaiter(this, void 0, void 0, function () {
            var _b, targetElementHandle, handles, i, currentElementInnerHTML;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!selector) return [3 /*break*/, 4];
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, page.waitForSelector(selector)];
                    case 2:
                        _c.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        _b = _c.sent();
                        throw new Error("Element that matches selector \"" + selector + "\" not found.");
                    case 4:
                        targetElementHandle = null;
                        if (!innerHTML) return [3 /*break*/, 10];
                        return [4 /*yield*/, page.$$(selector || '*')];
                    case 5:
                        handles = _c.sent();
                        i = 0;
                        _c.label = 6;
                    case 6:
                        if (!(i < handles.length)) return [3 /*break*/, 9];
                        return [4 /*yield*/, page.evaluate(function (element) { return element.innerHTML; }, handles[i])];
                    case 7:
                        currentElementInnerHTML = _c.sent();
                        if (typeof innerHTML === 'string') {
                            if (currentElementInnerHTML === innerHTML) {
                                targetElementHandle = handles[i];
                            }
                        }
                        else if (innerHTML.test(currentElementInnerHTML)) {
                            targetElementHandle = handles[i];
                        }
                        _c.label = 8;
                    case 8:
                        i++;
                        return [3 /*break*/, 6];
                    case 9: return [3 /*break*/, 12];
                    case 10: return [4 /*yield*/, page.$(selector || '*')];
                    case 11:
                        targetElementHandle = _c.sent();
                        _c.label = 12;
                    case 12:
                        if (targetElementHandle) {
                            return [2 /*return*/, targetElementHandle];
                        }
                        throw new Error("Element" + (selector && " that matches selector \"" + selector + "\"") + " with innerHTML \"" + innerHTML + "\" not found.");
                }
            });
        });
    };
    FigmaBotCommonActions.clearInput = function (page, input) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, input.click({ clickCount: 3 })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, page.keyboard.press('Backspace')];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    FigmaBotCommonActions.click = function (page, elementHandle, mouseButton) {
        return __awaiter(this, void 0, void 0, function () {
            var clientRect;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, page.evaluate(function (target) {
                            var _a = target.getBoundingClientRect(), x = _a.x, y = _a.y, width = _a.width, height = _a.height;
                            return { x: x, y: y, width: width, height: height };
                        }, elementHandle)];
                    case 1:
                        clientRect = _a.sent();
                        return [4 /*yield*/, page.mouse.click(clientRect.x + functions_1.random(0, clientRect.width), clientRect.y + functions_1.random(0, clientRect.height), {
                                button: mouseButton ? mouseButton : 'left'
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    FigmaBotCommonActions.moveCursor = function (page, x, y) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, page.mouse.move(x, y)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    FigmaBotCommonActions.clickByCursor = function (page, x, y) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, page.mouse.click(x, y)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    FigmaBotCommonActions.getNextSiblingHandle = function (page, elementHandle) {
        return __awaiter(this, void 0, void 0, function () {
            var nextSiblingHandle;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, page.evaluateHandle(function (projectName) { return projectName.nextElementSibling; }, elementHandle)];
                    case 1:
                        nextSiblingHandle = (_a.sent()).asElement();
                        if (!nextSiblingHandle) {
                            throw new Error('Next sibling not found');
                        }
                        return [2 /*return*/, nextSiblingHandle];
                }
            });
        });
    };
    FigmaBotCommonActions.goTo = function (page, targetURL) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (page.url().includes(targetURL)) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, page.goto(targetURL)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, FigmaBotCommonActions.waitForRedirects({
                                page: page,
                                timeout: 5000
                            })];
                    case 2:
                        _a.sent();
                        if (!page.url().includes(targetURL)) {
                            throw new Error("Page loading failed.");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    FigmaBotCommonActions.goToTeamPage = function (page, teamId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, FigmaBotCommonActions.goTo(page, "https://www.figma.com/files/team/" + teamId)];
                    case 1:
                        _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a = _b.sent();
                        throw new Error("Team with id \"" + teamId + "\" page loading failed.");
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    FigmaBotCommonActions.goToProjectPage = function (page, projectId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, FigmaBotCommonActions.goTo(page, "https://www.figma.com/files/project/" + projectId)];
                    case 1:
                        _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a = _b.sent();
                        throw new Error("Project with id \"" + projectId + "\" page loading failed.");
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    FigmaBotCommonActions.goToFilePage = function (page, fileId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, FigmaBotCommonActions.goTo(page, "https://www.figma.com/file/" + fileId)];
                    case 1:
                        _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a = _b.sent();
                        throw new Error("File with id \"" + fileId + "\" page loading failed.");
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    FigmaBotCommonActions.submitSingInForm = function (page, authData, delayDuration) {
        if (delayDuration === void 0) { delayDuration = 2000; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, functions_1.wait(delayDuration)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, page.click('form#auth-view-page > input[name="email"]')];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, functions_1.wait(delayDuration)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, page.keyboard.type(authData.email, { delay: 200 })];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, functions_1.wait(delayDuration)];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, page.click('form#auth-view-page > input[name="password"]')];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, functions_1.wait(delayDuration)];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, page.keyboard.type(authData.password, { delay: 200 })];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, functions_1.wait(delayDuration)];
                    case 9:
                        _a.sent();
                        return [4 /*yield*/, page.click('form#auth-view-page > button[type="submit"]')];
                    case 10:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    FigmaBotCommonActions.parseLoginPageError = function (page) {
        return __awaiter(this, void 0, void 0, function () {
            var emailInputHandle, passwordInputHandle;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, FigmaBotCommonActions.findElement(page, {
                            selector: 'form#auth-view-page > input[name="email"]'
                        })];
                    case 1:
                        emailInputHandle = _a.sent();
                        return [4 /*yield*/, FigmaBotCommonActions.findElement(page, {
                                selector: 'form#auth-view-page > input[name="password"]'
                            })];
                    case 2:
                        passwordInputHandle = _a.sent();
                        return [4 /*yield*/, page.evaluate(function (emailInput, passwordInput) {
                                if (emailInput.classList.toString().includes('invalidInput')) {
                                    return 'Invalid email';
                                }
                                if (passwordInput.classList.toString().includes('invalidInput')) {
                                    return 'Invalid password';
                                }
                                return null;
                            }, emailInputHandle, passwordInputHandle)];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    FigmaBotCommonActions.checkAuth = function (page) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (page.url().includes('https://www.figma.com/files/recent')) {
                            return [2 /*return*/, true];
                        }
                        return [4 /*yield*/, FigmaBotCommonActions.waitAndNavigate(page, page.goto('https://www.figma.com/files/recent'))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, page.url().includes('https://www.figma.com/files/recent')];
                }
            });
        });
    };
    return FigmaBotCommonActions;
}());
exports.FigmaBotCommonActions = FigmaBotCommonActions;
//# sourceMappingURL=figmaBot.common.actions.js.map