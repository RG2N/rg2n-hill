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
exports.ClientPacketType = void 0;
// Dependencies
const smart_buffer_1 = require("smart-buffer");
const zlib_1 = __importDefault(require("zlib"));
// Game objects
const Game_1 = __importDefault(require("../class/Game"));
const Player_1 = __importDefault(require("../class/Player"));
// Utility
const whitelisted_1 = __importDefault(require("../util/keys/whitelisted"));
const generateTitle_1 = __importDefault(require("../util/chat/generateTitle"));
const uintv_1 = require("./uintv");
const scripts_1 = __importDefault(require("../scripts"));
const checkAuth_1 = __importDefault(require("../api/checkAuth"));
const Sanction_1 = __importDefault(require("../class/Sanction"));
var ClientPacketType;
(function (ClientPacketType) {
    ClientPacketType[ClientPacketType["Authentication"] = 1] = "Authentication";
    ClientPacketType[ClientPacketType["Position"] = 2] = "Position";
    ClientPacketType[ClientPacketType["Command"] = 3] = "Command";
    ClientPacketType[ClientPacketType["Projectile"] = 4] = "Projectile";
    ClientPacketType[ClientPacketType["ClickDetection"] = 5] = "ClickDetection";
    ClientPacketType[ClientPacketType["PlayerInput"] = 6] = "PlayerInput";
    ClientPacketType[ClientPacketType["Heartbeat"] = 18] = "Heartbeat";
})(ClientPacketType = exports.ClientPacketType || (exports.ClientPacketType = {}));
function handlePacketType(type, socket, reader) {
    return __awaiter(this, void 0, void 0, function* () {
        const player = socket.player;
        // Drop auth-required packets if the client isn't authenticated.
        if (type !== ClientPacketType.Authentication && !player)
            return;
        switch (type) {
            case ClientPacketType.Authentication: {
                if (socket._attemptedAuthentication) {
                    if (Sanction_1.default.banSocket(socket))
                        return console.warn("[SANCTION] Client attempted to authenticate more than once.");
                    // If sanction is disabled we should destroy their socket.
                    return socket.destroy();
                }
                socket._attemptedAuthentication = true;
                const authResponse = yield (0, checkAuth_1.default)(socket, reader);
                // User could not authenticate properly.
                if (typeof authResponse === "string") {
                    console.log(`<Client: ${socket.IP}> Failed verification.`);
                    return scripts_1.default.kick(socket, authResponse);
                }
                // Check if the users socket is still active after authentication.
                if (socket.destroyed)
                    return;
                // Check if player is already in game + kick them if so.
                for (const player of Game_1.default.players) {
                    if (player.userId === authResponse.userId)
                        return scripts_1.default.kick(socket, "You can only join this game once per account.");
                }
                const authUser = new Player_1.default(socket);
                // Make properties readonly.
                Object.defineProperties(authUser, {
                    userId: { value: authResponse.userId },
                    username: { value: authResponse.username },
                    admin: { value: authResponse.admin },
                    membershipType: { value: authResponse.membershipType },
                    client: { value: authResponse.client },
                    validationToken: { value: authResponse.validator }
                });
                console.log(`Successfully verified! (Username: ${authUser.username} | ID: ${authUser.userId} | Admin: ${authUser.admin})`);
                // Finalize the player joining process.
                Game_1.default._newPlayer(authUser);
                break;
            }
            case ClientPacketType.Position: {
                const positionChanges = [];
                try {
                    for (let i = 0; i < 5; i++) {
                        const pos = reader.readFloatLE();
                        if (!Number.isFinite(pos))
                            throw "Unsafe";
                        positionChanges.push(pos);
                    }
                }
                catch (err) {
                    return;
                }
                player._updatePositionForOthers(positionChanges);
                break;
            }
            case ClientPacketType.Command: {
                let command = "", args = "";
                try {
                    command = reader.readStringNT();
                    args = reader.readStringNT();
                }
                catch (err) {
                    return;
                }
                // Strip unicode
                // eslint-disable-next-line no-control-regex
                args = args.replace(/[^\x00-\x7F]/g, "");
                if (command !== "chat")
                    return Game_1.default.emit("command", command, player, args);
                // The host wants to manage chat on their own
                if (Game_1.default.listeners("chat").length)
                    return Game_1.default.emit("chat", player, args, (0, generateTitle_1.default)(player, args));
                player.messageAll(args);
                break;
            }
            case ClientPacketType.Projectile: {
                break;
            }
            case ClientPacketType.ClickDetection: {
                try {
                    const brickId = reader.readUInt32LE();
                    // Check for global bricks with that Id.
                    const brick = Game_1.default.world.bricks.find(brick => brick.netId === brickId);
                    if (brick && brick.clickable)
                        return brick.emit("clicked", player);
                    // The brick might be local.
                    const localBricks = player.localBricks;
                    const localBrick = localBricks.find(brick => brick.netId === brickId);
                    if (localBrick && localBrick.clickable)
                        return localBrick.emit("clicked", player);
                }
                catch (err) {
                    return;
                }
                break;
            }
            case ClientPacketType.PlayerInput: {
                try {
                    const click = Boolean(reader.readUInt8());
                    const key = reader.readStringNT();
                    if (click)
                        player.emit("mouseclick");
                    if (key && whitelisted_1.default.includes(key))
                        player.emit("keypress", key);
                }
                catch (err) {
                    return;
                }
                break;
            }
            case ClientPacketType.Heartbeat: {
                player.socket.keepalive.restartTimer();
            }
        }
    });
}
function parsePacket(socket, rawBuffer) {
    return __awaiter(this, void 0, void 0, function* () {
        let packets = [];
        if (rawBuffer.length <= 1)
            return;
        (function readMessages(socket) {
            if (!socket._chunk.remaining) {
                const { messageSize, end } = (0, uintv_1.readUIntV)(socket._chunk.recieve);
                if (messageSize > 2500 && Sanction_1.default.banSocket(socket)) {
                    packets = [];
                    Sanction_1.default.debugLog({ banType: "UINTV_SIZE", uintvSize: messageSize, buffer: socket._chunk.recieve.toString('hex') });
                    socket._chunk.recieve = Buffer.alloc(0);
                    socket._chunk.remaining = 0;
                    return console.warn("[SANCTION] Client sent a packet with a large uintv size.");
                }
                socket._chunk.remaining = messageSize;
                socket._chunk.recieve = socket._chunk.recieve.slice(end);
            }
            // Packet is complete
            if (socket._chunk.recieve.length === socket._chunk.remaining) {
                packets.push(socket._chunk.recieve);
                socket._chunk.recieve = Buffer.alloc(0);
                socket._chunk.remaining = 0;
                return;
            }
            // Remaining packets
            if (socket._chunk.remaining < socket._chunk.recieve.length) {
                packets.push(socket._chunk.recieve.slice(0, socket._chunk.remaining));
                socket._chunk.recieve = socket._chunk.recieve.slice(socket._chunk.remaining);
                socket._chunk.remaining = 0;
                readMessages(socket);
            }
        })(socket);
        for (let packet of packets) {
            try {
                packet = zlib_1.default.inflateSync(packet);
            }
            catch (err) { }
            const reader = smart_buffer_1.SmartBuffer.fromBuffer(packet);
            // Check for the packet type
            let type;
            try {
                type = reader.readUInt8();
            }
            catch (err) { }
            // Packet ID was not valid
            if (Game_1.default.banNonClientTraffic && !Object.values(ClientPacketType).includes(type)) {
                if (Sanction_1.default.banSocket(socket)) {
                    Sanction_1.default.debugLog({ banType: "NON_BH_TRAFFIC", packetType: type, buffer: packet.toString('hex') });
                    return console.warn("[SANCTION] Client sent non-Brick Hill traffic.");
                }
            }
            // For performance reasons, I'm going to verify scripts are actually listening to gmPacket
            // before initiating a SmartBuffer instance for every packet.
            if (socket.listenerCount("gmPacket")) {
                socket.emit("gmPacket", {
                    packetId: type,
                    data: smart_buffer_1.SmartBuffer.fromBuffer(packet)
                });
            }
            handlePacketType(type, socket, reader);
        }
    });
}
exports.default = parsePacket;
