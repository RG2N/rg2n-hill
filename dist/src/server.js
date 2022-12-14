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
// Import dependencies
const net_1 = __importDefault(require("net"));
const Game_1 = __importDefault(require("./class/Game"));
// Post server
const postServer_1 = __importDefault(require("./api/postServer"));
// Connection + packet handler
const packetHandler_1 = __importDefault(require("./net/packetHandler"));
const Sanction_1 = __importDefault(require("./class/Sanction"));
// Create socket server.
const SERVER = net_1.default.createServer(socketConnection);
function maskIP(ip) {
    ip = ip.split(".").splice(0, 2);
    return ip.join(".") + ".x.x";
}
function socketConnection(client) {
    return __awaiter(this, void 0, void 0, function* () {
        client._chunk = {
            recieve: Buffer.alloc(0),
            remaining: 0,
        };
        client.IPV4 = client.remoteAddress;
        if (Sanction_1.default.bannedIPs.has(client.IPV4))
            return client.destroy();
        client.IP = maskIP(client.IPV4);
        client._attemptedAuthentication = false;
        console.log(`<New client: ${client.IP}>`);
        client.setNoDelay(true);
        Game_1.default.emit("socketConnection", client);
        client.once("close", () => __awaiter(this, void 0, void 0, function* () {
            console.log(`<Client: ${client.IP}> Lost connection.`);
            if (client.player) {
                yield Game_1.default._playerLeft(client.player)
                    .catch(console.error);
            }
            return !client.destroyed && client.destroy();
        }));
        client.on("error", () => {
            return !client.destroyed && client.destroy();
        });
        client.keepalive = {
            timer: null,
            keepAliveTime: 30000,
            kickIdlePlayer: function () {
                if (client.player && !client.destroyed)
                    return client.player.kick('Lack of connectivity.');
            },
            restartTimer: function () {
                if (this.timer)
                    clearTimeout(this.timer);
                this.timer = setTimeout(this.kickIdlePlayer, this.keepAliveTime);
            }
        };
        client.on("data", (PACKET) => {
            client._chunk.recieve = Buffer.concat([
                client._chunk.recieve,
                PACKET
            ]);
            (0, packetHandler_1.default)(client, PACKET)
                .catch(console.error);
        });
        // If the player fails to authenticate after 15 seconds.
        setTimeout(() => { return !client.player && client.destroy(); }, 15000);
    });
}
const SERVER_LISTEN_ADDRESS = Game_1.default.ip || ((!Game_1.default.local && "0.0.0.0") || "127.0.0.1");
SERVER.listen(Game_1.default.port, SERVER_LISTEN_ADDRESS, () => {
    console.log(`Listening on port: ${Game_1.default.port}.`);
    if (Game_1.default.local)
        return console.log("Running server locally.");
    if (Game_1.default.serverSettings.postServer) {
        (0, postServer_1.default)().then(() => {
            console.log(`Posted to: ${Game_1.default.gameId} successfully.`);
            setInterval(postServer_1.default, 60000);
        });
    }
});
Game_1.default.server = SERVER;
process.on("uncaughtException", (err) => {
    console.error("Asynchronous error caught: \n", err);
});
