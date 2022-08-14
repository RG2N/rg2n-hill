var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/*eslint no-undef: "off"*/
function load(options) {
    return __awaiter(this, void 0, void 0, function* () {
        require("nh-admin");
        if (options === "object")
            Object.assign(Game.cheatsAdmin, options);
        if (Game.local)
            Game.on("playerJoin", (p) => Game.cheatsAdmin.owners.push(p.userId));
        else if (Game.gameId)
            try {
                const res = yield Game.getSetData(Game.gameId);
                if (res.error)
                    throw res.error.message;
                const creator = res.data.creator;
                if (!Game.cheatsAdmin.owners.includes(creator.id)) {
                    Game.cheatsAdmin.owners.push(creator.id);
                    console.log(`[cheatsAdmin] Set ${creator.username} as admin.`);
                }
            }
            catch (err) {
                console.warn("[cheatsAdmin] Failed to add set owner as admin.");
            }
        return Game.cheatsAdmin;
    });
}
initCheatsAdmin = load;
