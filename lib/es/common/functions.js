export var random = function (min, max) {
    return min + Math.round(Math.random() * (max - min));
};
export var wait = function (timeout) {
    return new Promise(function (resolve) { return setTimeout(resolve, timeout); });
};
//# sourceMappingURL=functions.js.map