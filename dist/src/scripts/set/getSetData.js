var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const phin = require("phin")
    .defaults({ parse: "json", timeout: 12000 });
const API = `https://api.brick-hill.com/v1/sets/`;
function getSetData(setId) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = (yield phin({ url: API + parseInt(setId) })).body;
        return data;
    });
}
module.exports = getSetData;
