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
const API = (groupId, user) => `https://api.brick-hill.com/v1/clan/member?id=${groupId}&user=${user}`;
function getRankInGroup(groupId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        let groupData = false;
        const data = (yield phin({ url: API(groupId, userId) })).body;
        if (data.status && data.status === "accepted") {
            groupData = data;
        }
        return groupData;
    });
}
module.exports = getRankInGroup;
