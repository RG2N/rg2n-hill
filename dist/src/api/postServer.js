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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Game_1 = __importDefault(require("../class/Game"));
const phin = require("phin")
    .defaults({
    url: "https://api.brick-hill.com/v1/games/postServer",
    method: "POST",
    timeout: 12000
});
function postServer() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const postData = {
                "host_key": Game_1.default.hostKey,
                "port": Game_1.default.port,
                "players": Game_1.default.players.map(player => player.validationToken)
            };
            const response = yield phin({ data: postData });
            try {
                const body = JSON.parse(response.body);
                if (body.error) {
                    console.warn("Failure while posting to games page:", JSON.stringify(body.error.message || body));
                    if (body.error.message === "You can only postServer once every minute")
                        return;
                    return process.exit(0);
                }
            }
            catch (err) { } // It was successful (?)
        }
        catch (err) {
            console.warn("Error while posting to games page.");
            console.error(err.stack);
        }
    });
}
exports.default = postServer;
