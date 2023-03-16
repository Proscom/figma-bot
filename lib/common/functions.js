"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wait = exports.random = void 0;
var random = function (min, max) {
    return min + Math.round(Math.random() * (max - min));
};
exports.random = random;
var wait = function (timeout) {
    return new Promise(function (resolve) { return setTimeout(resolve, timeout); });
};
exports.wait = wait;
//# sourceMappingURL=functions.js.map