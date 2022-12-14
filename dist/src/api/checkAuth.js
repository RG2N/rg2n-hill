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
    .defaults({ "parse": "json", "timeout": 12000 });
const AUTHENTICATION_API = (token, hostKey) => (`https://api.brick-hill.com/v1/auth/verifyToken?token=${encodeURIComponent(token)}&host_key=${encodeURIComponent(hostKey)}`);
const UID_REGEX = /[\w]{8}(-[\w]{4}){3}-[\w]{12}/;
// For local servers
let playerId = 0;
function checkAuth(socket, reader) {
    return __awaiter(this, void 0, void 0, function* () {
        // Don't use any of this, it needs to be verified.
        const USER = {
            token: reader.readStringNT(),
            version: reader.readStringNT(),
            clientId: 0
        };
        // Version check
        if (USER.version !== "0.3.1.0")
            return "Client version does not match this server's client version.";
        // User might be using Brickplayer
        if (reader.remaining())
            USER.clientId = reader.readUInt8() || 0;
        console.log(`<Client: ${socket.IP}> Attempting authentication.`);
        if (Game_1.default.local) {
            playerId++;
            return {
                username: "Player" + playerId,
                userId: playerId,
                admin: false,
                membershipType: 1,
                client: USER.clientId
            };
        }
        // Invalid token format.
        if (!UID_REGEX.test(USER.token))
            return "Token format is incorrect.";
        try {
            const data = (yield phin({ url: AUTHENTICATION_API(USER.token, Game_1.default.hostKey) })).body;
            if (!data.error) {
                return {
                    username: data.user.username,
                    userId: Number(data.user.id),
                    admin: data.user.is_admin,
                    // screw you jefemy
                    membershipType: (data.user.membership && data.user.membership.membership) || 1,
                    client: USER.clientId,
                    validator: data.validator,
                };
            }
        }
        catch (err) {
            console.warn(`<Error while authenticating: ${socket.IP}>`, err.message);
            return "Server error while authenticating.";
        }
        return "Invalid authentication token provided.";
    });
}
exports.default = checkAuth;
