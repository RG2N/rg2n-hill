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
    .defaults({ "parse": "json", "timeout": 12000 });
const GET_ASSETS = "https://api.brick-hill.com/v1/games/retrieveAvatar?id=";
function getNonEmptyHats(assets) {
    const hats = [];
    for (let i = 0; i < 5; i++) {
        if (hats.length >= 3)
            break;
        const hat = assets.hats[i];
        if (hat)
            hats.push(hat);
    }
    return hats;
}
function setAvatar(p, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = (yield phin({ url: GET_ASSETS + userId })).body;
        if (data.error)
            throw new Error(data.error.message);
        p.colors.head = "#" + data.colors.head.toLowerCase();
        p.colors.torso = "#" + data.colors.torso.toLowerCase();
        p.colors.leftArm = "#" + data.colors.left_arm.toLowerCase();
        p.colors.rightArm = "#" + data.colors.right_arm.toLowerCase();
        p.colors.leftLeg = "#" + data.colors.left_leg.toLowerCase();
        p.colors.rightLeg = "#" + data.colors.right_leg.toLowerCase();
        p.assets.tool = data.items.tool;
        p.assets.face = data.items.face;
        p.assets.tshirt = data.items.tshirt;
        p.assets.shirt = data.items.shirt;
        p.assets.pants = data.items.pants;
        const hats = getNonEmptyHats(data.items);
        p.assets.hat1 = hats[0] || 0;
        p.assets.hat2 = hats[1] || 0;
        p.assets.hat3 = hats[2] || 0;
        return true;
    });
}
module.exports = setAvatar;
