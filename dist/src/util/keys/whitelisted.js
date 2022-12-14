"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyTypes = void 0;
/**
 * An enum that contains a list of all the keys allowed in player.keypress.
 *
 * This is meant to verify packets to ensure that only valid key types are being sent.
 */
var KeyTypes;
(function (KeyTypes) {
    KeyTypes["alphabetical"] = "a-z";
    KeyTypes["numerical"] = "0-9";
    KeyTypes["shift"] = "shift";
    KeyTypes["space"] = "space";
    KeyTypes["enter"] = "enter";
    KeyTypes["backspace"] = "backspace";
})(KeyTypes = exports.KeyTypes || (exports.KeyTypes = {}));
const keys = "abcdefghijklmnopqrstuvwxyz0123456789".split("");
keys.push("enter");
keys.push("space");
keys.push("shift");
keys.push("control");
keys.push("backspace");
exports.default = keys;
