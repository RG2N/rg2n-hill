"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const filter_json_1 = __importDefault(require("./filter.json"));
let regex = new RegExp(filter_json_1.default.join("|"), "i");
function setFilter(filter) {
    regex = new RegExp(filter.join("|"), "i");
}
function getFilter() {
    return filter_json_1.default;
}
function isSwear(input) {
    return regex.test(input);
}
exports.default = { getFilter, setFilter, isSwear };
