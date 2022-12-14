"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.PlayerEvents = exports.CameraType = exports.Client = void 0;
const events_1 = require("events");
const Game_1 = __importDefault(require("./Game"));
const scripts = __importStar(require("../scripts"));
const PacketBuilder_1 = __importStar(require("../net/PacketBuilder"));
const playerIds_1 = __importDefault(require("../net/BrickHillPackets/playerIds"));
const assetIds_1 = __importDefault(require("../net/BrickHillPackets/assetIds"));
const Vector3_1 = __importDefault(require("./Vector3"));
const Tool_1 = __importDefault(require("./Tool"));
var Client;
(function (Client) {
    /**The original client made by Luke */
    Client[Client["Classic"] = 0] = "Classic";
    /**Brickplayer by Ty */
    Client[Client["BrickPlayer"] = 1] = "BrickPlayer";
    /**Player2 by Ezcha */
    Client[Client["Player2"] = 2] = "Player2";
})(Client = exports.Client || (exports.Client = {}));
var CameraType;
(function (CameraType) {
    /**The camera is fixed in place. You can set the position of it. */
    CameraType["Fixed"] = "fixed";
    /**The camera is orbiting the cameraObject (a player). You cannot set the position of it. */
    CameraType["Orbit"] = "orbit";
    /**The camera is free-floating, the player can move it with WASD. (Glitchy and really bad). */
    CameraType["Free"] = "free";
    /**The player's camera is locked in first person. */
    CameraType["First"] = "first";
})(CameraType = exports.CameraType || (exports.CameraType = {}));
var PlayerEvents;
(function (PlayerEvents) {
    PlayerEvents["InitialSpawn"] = "initialSpawn";
    PlayerEvents["Died"] = "died";
    PlayerEvents["Respawn"] = "respawn";
    PlayerEvents["AvatarLoaded"] = "avatarLoaded";
    PlayerEvents["Chatted"] = "chatted";
    PlayerEvents["Moved"] = "moved";
})(PlayerEvents = exports.PlayerEvents || (exports.PlayerEvents = {}));
class Player extends events_1.EventEmitter {
    constructor(socket) {
        super();
        /** True if the player has left the game. */
        this.destroyed = false;
        /** The current scale of the player. */
        this.scale = new Vector3_1.default(1, 1, 1);
        /** The value the player's health will be set to when they respawn. **/
        this.maxHealth = 100;
        /** If set to true, the server will reject any chat attempts from the player. **/
        this.muted = false;
        /** The current speed of the player. */
        this.speed = 4;
        /** How high the player can jump. */
        this.jumpPower = 5;
        /** The current score of the player. */
        this.score = 0;
        /** The current speech bubble of the player. ("" = empty). */
        this.speech = "";
        /** If set to false, the player will not automatically load their avatar. */
        this.loadAvatar = true;
        /** If set to false, the player will not spawn with their tool equipped. \
         * loadAvatar MUST be enabled for this to work.*/
        this.loadTool = true;
        Player.playerId += 1;
        this.socket = socket;
        this.netId = Player.playerId;
        this.localBricks = [];
        this._steps = [];
        this._positionDeltaTime = Date.now();
        this.inventory = [];
        this.blockedUsers = [];
        this.destroyed = false;
        this.spawnHandler = scripts.pickSpawn;
        this.position = new Vector3_1.default(0, 0, 0);
        this.rotation = new Vector3_1.default(0, 0, 0);
        this.scale = new Vector3_1.default(1, 1, 1);
        this.cameraFOV = 60;
        this.cameraDistance = 5;
        this.cameraPosition = new Vector3_1.default(0, 0, 0);
        this.cameraRotation = new Vector3_1.default(0, 0, 0);
        this.cameraType = CameraType.Fixed;
        this.cameraObject = this;
        this.colors = {
            head: "#d9bc00",
            torso: "#d9bc00",
            leftArm: "#d9bc00",
            rightArm: "#d9bc00",
            leftLeg: "#d9bc00",
            rightLeg: "#d9bc00",
        };
        this.assets = {
            tool: 0,
            face: 0,
            hat1: 0,
            hat2: 0,
            hat3: 0,
            shirt: 0,
            pants: 0,
            tshirt: 0
        };
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.alive = false;
        this.muted = false;
        this.speed = 4;
        this.speech = "";
        this.jumpPower = 5;
        this.score = 0;
        this.toolEquipped = null;
        this.client = Client.Classic;
    }
    /**
   * Calls back whenever the player clicks.
   * @callback
   * @example
   * ```js
   * player.mouseclick(() => {
   *    // The player clicked.
   * })
   * ```
   */
    mouseclick(callback) {
        const clickCallback = () => {
            callback();
        };
        this.on("mouseclick", clickCallback);
        return {
            disconnect: () => this.off("mouseclick", clickCallback)
        };
    }
    /**
   * Calls back whenever the player presses a key.
   * @callback
   * @example
   * ```js
   * Game.on("initialSpawn", (player) => {
   *    player.speedCooldown = false
   *
   *    player.keypress(async(key) => {
   *        if (player.speedCooldown) return
   *        if (key === "shift") {
   *            player.speedCooldown = true
   *
   *            player.bottomPrint("Boost activated!", 3)
   *
   *            player.setSpeed(8)
   *
   *            await sleep(3000)
   *
   *            player.setSpeed(4)
   *
   *            player.bottomPrint("Boost cooldown...", 6)
   *
   *            setTimeout(() => {
   *                player.speedCooldown = false
   *            }, 6000)
   *        }
   *    })
   * })
   * ```
   **/
    keypress(callback) {
        const kpCallback = (key) => {
            callback(key);
        };
        this.on("keypress", kpCallback);
        return {
            disconnect: () => this.off("keypress", kpCallback)
        };
    }
    /**
     * Kicks the player from the game.
     * @param message The kick message
     */
    kick(message) {
        return __awaiter(this, void 0, void 0, function* () {
            return scripts.kick(this.socket, message);
        });
    }
    /**
     * Clears all of the bricks for the player. This is a LOCAL change. \
     * world.bricks will not be updated!
     */
    clearMap() {
        return __awaiter(this, void 0, void 0, function* () {
            return new PacketBuilder_1.default(PacketBuilder_1.PacketEnums.ClearMap)
                .write("bool", true) // There's a bug with packets that contain no data.
                .send(this.socket);
        });
    }
    _log(message, broadcast = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!Game_1.default.systemMessages)
                return;
            if (broadcast)
                return scripts.message.messageAll(message);
            else
                return scripts.message.messageClient(this.socket, message);
        });
    }
    _removePlayer() {
        return __awaiter(this, void 0, void 0, function* () {
            return new PacketBuilder_1.default(PacketBuilder_1.PacketEnums.RemovePlayer)
                .write("uint32", this.netId)
                .broadcastExcept([this]);
        });
    }
    topPrint(message, seconds) {
        return __awaiter(this, void 0, void 0, function* () {
            return scripts.topPrint(this.socket, message, seconds);
        });
    }
    centerPrint(message, seconds) {
        return __awaiter(this, void 0, void 0, function* () {
            return scripts.centerPrint(this.socket, message, seconds);
        });
    }
    bottomPrint(message, seconds) {
        return __awaiter(this, void 0, void 0, function* () {
            return scripts.bottomPrint(this.socket, message, seconds);
        });
    }
    /** Prompts a confirm window on the player's client. */
    prompt(message) {
        return __awaiter(this, void 0, void 0, function* () {
            return scripts.prompt(this.socket, message);
        });
    }
    /**
     * Sends a local message to the player.
     * @param message The message
     */
    message(message) {
        return __awaiter(this, void 0, void 0, function* () {
            return scripts.message.messageClient(this.socket, message);
        });
    }
    /** Sends a chat message to everyone, conforming to rate-limit / mute checks, etc. */
    messageAll(message, generateTitle = true) {
        return __awaiter(this, void 0, void 0, function* () {
            return scripts.message.clientMessageAll(this, message, generateTitle);
        });
    }
    setOutfit(outfit) {
        return __awaiter(this, void 0, void 0, function* () {
            const promises = [];
            // Patch assets + colors
            Object.assign(this.assets, outfit.assets);
            Object.assign(this.colors, outfit.colors);
            promises.push((0, playerIds_1.default)(this, "KLMNOP").broadcast(), (0, assetIds_1.default)(this, outfit.idString).then(b => b.broadcast()));
            return Promise.all(promises);
        });
    }
    /** Sets the players health. If the health provided is larger than maxHealth, maxHealth will automatically be \
     *  set to the new health value.
     */
    setHealth(health) {
        return __awaiter(this, void 0, void 0, function* () {
            if (health <= 0 && this.alive) {
                return this.kill();
            }
            else {
                if (health > this.maxHealth)
                    this.health = this.maxHealth;
                this.health = health;
                return (0, playerIds_1.default)(this, "e")
                    .send(this.socket);
            }
        });
    }
    setScore(score) {
        return __awaiter(this, void 0, void 0, function* () {
            if (isNaN(score))
                throw 'Score must be a number.';
            this.score = Number(score);
            return (0, playerIds_1.default)(this, "X")
                .broadcast();
        });
    }
    setTeam(team) {
        return __awaiter(this, void 0, void 0, function* () {
            this.team = team;
            return (0, playerIds_1.default)(this, "Y")
                .broadcast();
        });
    }
    _greet() {
        if (Game_1.default.MOTD) {
            this._log(Game_1.default.MOTD);
        }
        this._log(`\\c6[SERVER]: \\c0${this.username} has joined the server!`, true);
    }
    setCameraPosition(position) {
        return __awaiter(this, void 0, void 0, function* () {
            this.cameraPosition = new Vector3_1.default().fromVector(position);
            return (0, playerIds_1.default)(this, "567")
                .send(this.socket);
        });
    }
    setCameraRotation(rotation) {
        return __awaiter(this, void 0, void 0, function* () {
            this.cameraRotation = new Vector3_1.default().fromVector(rotation);
            return (0, playerIds_1.default)(this, "89a")
                .send(this.socket);
        });
    }
    setCameraDistance(distance) {
        return __awaiter(this, void 0, void 0, function* () {
            this.cameraDistance = distance;
            return (0, playerIds_1.default)(this, "4")
                .send(this.socket);
        });
    }
    setCameraFOV(fov) {
        return __awaiter(this, void 0, void 0, function* () {
            this.cameraFOV = fov;
            return (0, playerIds_1.default)(this, "3")
                .send(this.socket);
        });
    }
    setCameraObject(player) {
        return __awaiter(this, void 0, void 0, function* () {
            this.cameraObject = player;
            return (0, playerIds_1.default)(this, "c")
                .send(this.socket);
        });
    }
    setCameraType(type) {
        return __awaiter(this, void 0, void 0, function* () {
            this.cameraType = type;
            return (0, playerIds_1.default)(this, "b")
                .send(this.socket);
        });
    }
    /** Returns an arary of all the players currently blocking this user. */
    getBlockedPlayers() {
        const players = [];
        for (const target of Game_1.default.players) {
            if (target.blockedUsers.includes(this.userId))
                players.push(target);
        }
        return players;
    }
    /** Adds the tool to the user's inventory. */
    addTool(tool) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.inventory.includes(tool))
                return Promise.reject("Player already has tool equipped.");
            this.inventory.push(tool);
            const toolPacket = yield scripts.toolPacket.create(tool);
            return toolPacket.send(this.socket);
        });
    }
    /** Takes an array of bricks and loads them to the client locally. */
    loadBricks(bricks) {
        return __awaiter(this, void 0, void 0, function* () {
            this.localBricks = this.localBricks.concat(bricks);
            const loadBricks = yield scripts.loadBricks(bricks);
            return loadBricks.send(this.socket);
        });
    }
    /** Takes an array of bricks, and deletes them all from this client. */
    deleteBricks(bricks) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const brick of bricks) {
                const index = this.localBricks.indexOf(brick);
                if (index !== -1)
                    this.localBricks.splice(index, 1);
            }
            return scripts.deleteBricks(bricks)
                .send(this.socket);
        });
    }
    /** Forces the player to unequip the tool, and removes it from their inventory. */
    destroyTool(tool) {
        return __awaiter(this, void 0, void 0, function* () {
            const index = this.inventory.indexOf(tool);
            if (index === -1)
                return; // Tool not found.
            this.inventory.splice(index, 1);
            return scripts.toolPacket.destroy(tool)
                .send(this.socket);
        });
    }
    /** Equips the tool, if It's not already in the user's inventory it will be added first. \
     * If you call this on a tool that is already equipped, it will be unequipped.
     */
    equipTool(tool) {
        return __awaiter(this, void 0, void 0, function* () {
            // They don't have the tool, add it first.
            if (!this.inventory.includes(tool))
                yield this.addTool(tool);
            const currentTool = this.toolEquipped;
            // Tool is already equpped, unequip it.
            if (currentTool === tool)
                return this.unequipTool(tool);
            // The player switched tools, inform the other one it's unequipped.
            if (currentTool)
                currentTool.emit("unequipped", this);
            this.toolEquipped = tool;
            tool.emit("equipped", this);
            const packet = yield (0, assetIds_1.default)(this, "g");
            return packet.broadcast();
        });
    }
    /** Unequips the tool from the player, but does not remove it from their inventory. */
    unequipTool(tool) {
        return __awaiter(this, void 0, void 0, function* () {
            this.toolEquipped = null;
            tool.emit("unequipped", this);
            return (0, playerIds_1.default)(this, "h")
                .broadcast();
        });
    }
    setSpeech(speech = "") {
        return __awaiter(this, void 0, void 0, function* () {
            this.speech = speech;
            return (0, playerIds_1.default)(this, "f")
                .broadcastExcept(this.getBlockedPlayers());
        });
    }
    setSpeed(speedValue) {
        return __awaiter(this, void 0, void 0, function* () {
            this.speed = speedValue;
            return (0, playerIds_1.default)(this, "1")
                .send(this.socket);
        });
    }
    setJumpPower(power) {
        return __awaiter(this, void 0, void 0, function* () {
            this.jumpPower = power;
            return (0, playerIds_1.default)(this, "2")
                .send(this.socket);
        });
    }
    _getClients() {
        return __awaiter(this, void 0, void 0, function* () {
            // There are no other clients to get.
            if (Game_1.default.players.length <= 1)
                return;
            const others = Game_1.default.players.filter(p => p !== this);
            if (others.length <= 0)
                return;
            const promises = [];
            // Send all other clients this client.
            const otherClientsPacket = new PacketBuilder_1.default(PacketBuilder_1.PacketEnums.SendPlayers)
                .write("uint8", 1)
                .write("uint32", this.netId)
                .write("string", this.username)
                .write("uint32", this.userId)
                .write("uint8", this.admin)
                .write("uint8", this.membershipType);
            promises.push(otherClientsPacket.broadcastExcept([this]));
            const sendPlayersPacket = new PacketBuilder_1.default(PacketBuilder_1.PacketEnums.SendPlayers);
            sendPlayersPacket.write("uint8", others.length);
            // Send this client all other clients.
            for (const player of others) {
                sendPlayersPacket.write("uint32", player.netId);
                sendPlayersPacket.write("string", player.username);
                sendPlayersPacket.write("uint32", player.userId);
                sendPlayersPacket.write("uint8", player.admin);
                sendPlayersPacket.write("uint8", player.membershipType);
            }
            promises.push(sendPlayersPacket.send(this.socket));
            return Promise.all(promises);
        });
    }
    /**@hidden */
    _updatePositionForOthers(pos) {
        return __awaiter(this, void 0, void 0, function* () {
            if (Date.now() - this._positionDeltaTime < 50)
                return;
            this._positionDeltaTime = Date.now();
            let idBuffer = "";
            if (pos[0] && this.position.x != pos[0]) {
                idBuffer += "A";
                this.position.x = pos[0];
            }
            if (pos[1] && this.position.y != pos[1]) {
                idBuffer += "B";
                this.position.y = pos[1];
            }
            if (pos[2] && this.position.z != pos[2]) {
                idBuffer += "C";
                this.position.z = pos[2];
            }
            if (pos[3] && this.rotation.z != pos[3]) {
                idBuffer += "F";
                this.rotation.z = pos[3];
            }
            if (pos[4] && this.rotation.x != pos[4]) {
                this.cameraRotation.x = pos[4];
            }
            if (idBuffer.length) {
                this.emit("moved", this.position, this.rotation.z);
                return (0, playerIds_1.default)(this, idBuffer)
                    .broadcastExcept([this]);
            }
        });
    }
    /**Clones a brick locally to the player's client, returns the newly created local brick. */
    newBrick(brick) {
        return __awaiter(this, void 0, void 0, function* () {
            const localBrick = brick.clone();
            localBrick.socket = this.socket;
            this.localBricks.push(localBrick);
            const packet = yield scripts.loadBricks([localBrick]);
            yield packet.send(this.socket);
            return localBrick;
        });
    }
    /**Clones an array of bricks locally to the player's client, returns an array containing the cloned bricks. */
    newBricks(bricks) {
        return __awaiter(this, void 0, void 0, function* () {
            const localBricks = [];
            for (const brick of bricks) {
                const localBrick = brick.clone();
                localBrick.socket = this.socket;
                this.localBricks.push(localBrick);
                localBricks.push(localBrick);
            }
            const packet = yield scripts.loadBricks(localBricks);
            yield packet.send(this.socket);
            return localBricks;
        });
    }
    setPosition(position) {
        return __awaiter(this, void 0, void 0, function* () {
            this.position = new Vector3_1.default().fromVector(position);
            this.emit("moved", this.position, this.rotation.z);
            const packetBuilder = (0, playerIds_1.default)(this, "ABCF");
            return packetBuilder.broadcast();
        });
    }
    setScale(scale) {
        return __awaiter(this, void 0, void 0, function* () {
            this.scale = new Vector3_1.default().fromVector(scale);
            const packetBuilder = (0, playerIds_1.default)(this, "GHI");
            return packetBuilder.broadcast();
        });
    }
    /**
     * Sets the appearance of the player. \
     * If a userId isn't specified, it will default to the player's userId.
     *
     * Error handling is highly recommended as this function makes a HTTP request.
     */
    setAvatar(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const promises = [];
            yield scripts.setAvatar(this, userId);
            const playerPacket = (0, playerIds_1.default)(this, "KLMNOP");
            const assetPacket = (0, assetIds_1.default)(this, "QRSTUVW");
            promises.push(playerPacket.broadcast(), assetPacket.then(p => p.broadcast()));
            return Promise.all(promises);
        });
    }
    avatarLoaded() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.on("avatarLoaded", (_, err) => {
                    if (err)
                        return reject(err);
                    return resolve();
                });
            });
        });
    }
    /**
   * Returns player stats in JSON from this API: \
   * https://api.brick-hill.com/v1/user/profile?id={userId}
   * @example
   * ```js
   * Game.on("playerJoin", async(player) => {
   *  const data = await player.getUserInfo()
   *  console.log(data)
   * })
  * ```
   */
    getUserInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            return scripts.getUserInfo(this.userId);
        });
    }
    /**
     * Returns true or false if the player owns a specified assetId.
     *
     * @example
     * ```js
     * Game.on("initialSpawn", async(p) => {
     *      let ownsAsset = await p.ownsAsset(106530)
     *      console.log("Player owns asset: ", ownsAsset)
     * })
    ```
     */
    ownsAsset(assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            return scripts.playerOwnsAsset(this.userId, assetId);
        });
    }
    /**
     * Returns JSON data of the users rank in a group, or false if they aren't in the group. \
     * https://api.brick-hill.com/v1/clan/member?id=1&user=1
     * @example
     * ```js
     * Game.on("playerJoin", async(player) => {
     *  const groupData = await player.getRankInGroup(5)
     *  if (groupData) {
     *      console.log(groupData)
     *  } else {
     *      console.log("Player is not in group.")
     *  }
     * })
    * ```
     */
    getRankInGroup(groupId) {
        return __awaiter(this, void 0, void 0, function* () {
            return scripts.getRankInGroup(groupId, this.userId);
        });
    }
    kill() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.alive)
                return;
            const promises = [];
            this.alive = false;
            this.health = 0;
            const killPacket = new PacketBuilder_1.default(PacketBuilder_1.PacketEnums.Kill)
                .write("uint32", this.netId)
                .write("bool", true);
            const healthPacket = (0, playerIds_1.default)(this, "e");
            promises.push(killPacket.broadcast(), healthPacket.send(this.socket));
            this.emit("died");
            return Promise.all(promises);
        });
    }
    /** Respawns the player. */
    respawn() {
        return __awaiter(this, void 0, void 0, function* () {
            const promises = [];
            let newSpawnPosition;
            if (this.spawnPosition) {
                newSpawnPosition = this.spawnPosition;
            }
            else {
                newSpawnPosition = (yield this.spawnHandler(this)) || scripts.pickSpawn();
            }
            yield this.setPosition(newSpawnPosition);
            const killPacket = new PacketBuilder_1.default(PacketBuilder_1.PacketEnums.Kill)
                .write("uint32", this.netId)
                .write("bool", false);
            this.alive = true;
            this.health = this.maxHealth;
            this.cameraType = CameraType.Orbit;
            this.cameraObject = this;
            this.cameraPosition = new Vector3_1.default(0, 0, 0);
            this.cameraRotation = new Vector3_1.default(0, 0, 0);
            this.cameraFOV = 60;
            this.toolEquipped = null;
            promises.push(killPacket.broadcast(), (0, playerIds_1.default)(this, "ebc56789a3h").send(this.socket));
            this.emit("respawn");
            return Promise.all(promises);
        });
    }
    /**
     * Identical to setInterval, but will be cleared after the player is destroyed.
     * Use this if you want to attach loops to players, but don't want to worry about clearing them.
     * @param callback The callback function.
     * @param delay The delay in milliseconds.
     */
    setInterval(callback, delay) {
        const loop = setInterval(callback, delay);
        this._steps.push(loop);
        return loop;
    }
    /**
     * Functionally the same to Game.setEnvironment, but sets the environment only for one player.
     * @example
     * ```js
     * Game.on("playerJoin", (p) => {
     *  p.setEnvironment( {skyColor: "6ff542"} )
     * })
     */
    setEnvironment(environment) {
        return __awaiter(this, void 0, void 0, function* () {
            return scripts.setEnvironment(environment, this.socket);
        });
    }
    _createFigures() {
        // Update player's figure for others
        (0, playerIds_1.default)(this, "ABCDEFGHIKLMNOPXYf")
            .broadcastExcept([this]);
        (0, assetIds_1.default)(this, "QRSTUVWg").then((packet) => {
            packet.broadcastExcept([this]);
        });
        // Update other figures for this player
        for (const player of Game_1.default.players) {
            if (player !== this) {
                (0, playerIds_1.default)(player, "ABCDEFGHIKLMNOPXYf")
                    .send(this.socket);
                (0, assetIds_1.default)(player, "QRSTUVWg").then((packet) => {
                    packet.send(this.socket);
                });
            }
        }
    }
    _createTools() {
        for (const tool of Game_1.default.world.tools) {
            this.addTool(tool);
        }
    }
    _createTeams() {
        for (const team of Game_1.default.world.teams) {
            scripts.teamPacket.create(team)
                .send(this.socket);
        }
    }
    _createBots() {
        for (const bot of Game_1.default.world.bots)
            scripts.botPacket(bot).then(b => b.send(this.socket));
    }
    /**@hidden */
    _left() {
        return __awaiter(this, void 0, void 0, function* () {
            this.destroyed = true;
            console.log(`${this.username} has left the game.`);
            this._log(`\\c6[SERVER]: \\c0${this.username} has left the server!`, true);
            this.removeAllListeners();
            this._steps.forEach((loop) => {
                clearInterval(loop);
            });
            yield this._removePlayer();
        });
    }
    /**@hidden */
    _joined() {
        return __awaiter(this, void 0, void 0, function* () {
            // Send player their information + brick count.
            yield scripts.sendAuthInfo(this);
            yield this._getClients();
            console.log(`${this.username} has joined | netId: ${this.netId}`);
            this._greet();
            yield this.setEnvironment(Game_1.default.world.environment);
            if (Game_1.default.sendBricks) {
                const map = yield scripts.loadBricks(Game_1.default.world.bricks);
                if (map)
                    yield map.send(this.socket);
            }
            this._createTeams();
            this._createTools();
            this._createBots();
            if (Game_1.default.assignRandomTeam && Game_1.default.world.teams.length)
                this.setTeam(Game_1.default.world.teams[Math.floor(Math.random() * Game_1.default.world.teams.length)]);
            if (Game_1.default.playerSpawning)
                yield this.respawn();
            this._createFigures();
            if (this.loadAvatar) {
                this.setAvatar(this.userId)
                    .then(() => {
                    this.emit("avatarLoaded", true);
                    if (this.loadTool && this.assets.tool) {
                        const tool = new Tool_1.default("Tool");
                        tool.model = this.assets.tool;
                        this.addTool(tool);
                    }
                })
                    .catch((err) => {
                    console.error(`Failure loading avatar appearance for ${this.username}: \n`, err.stack);
                    this.emit("avatarLoaded", false, err);
                });
            }
            this.mouseclick(() => {
                this.toolEquipped && this.toolEquipped.emit("activated", this);
            });
            this.socket.keepalive.restartTimer();
            this.emit("initialSpawn");
        });
    }
}
exports.default = Player;
/**
* Fires once when the player fully loads. (camera settings, map loads, players downloaded, etc).
* @event
* @example
* ```js
* Game.on("playerJoin", (player) => {
*    player.on("initialSpawn", () => {
*        player.prompt("Hello there!")
*    })
* })
* ```
*/
Player.initialSpawn = PlayerEvents.InitialSpawn;
/**
* Fires whenever a player dies (health set to 0).
* @event
* @example
* ```js
* Game.on("playerJoin", (player) => {
*    player.on("died", () => {
*        player.kick("This is a hardcore server.")
*    })
* })
* ```
*/
Player.died = PlayerEvents.Died;
/**
* Fires whenever a player spawns (respawn() is called.)
* @event
* @example
* ```js
* Game.on("playerJoin", (player) => {
*    player.on("respawn", () => {
*        player.setHealth(1000)
*    })
* })
* ```
*/
Player.respawn = PlayerEvents.Respawn;
/**
* Fires whenever a player's outfit loads.
* @event
* @example
* ```js
* Game.on("playerJoin", (player) => {
*    player.on("avatarLoaded", () => {
*        // The outfit is now loaded.
*    })
* })
* ```
*/
Player.avatarLoaded = PlayerEvents.AvatarLoaded;
/**
* Fires whenever the player chats. Functionality-wise this behaves like `Game.on("chatted")`.
* @event
* @param message Message
* @example
* ```js
* Game.on("playerJoin", (player) => {
*    player.on("chatted", (message) => {
*        // The player chatted.
*    })
* })
* ```
*/
Player.chatted = PlayerEvents.Chatted;
/**
 * Fires whenever this player moves.
 * @event
 * @param newPosition The new position of the player
 * @param newRotation The new rotation of the player
 * ```js
 * player.on("moved", (newPosition, newRotation)=>{
 *    console.log(`${player.username} moved to ${newPosition.x}, ${newPosition.y}, ${newPosition.z}`)
 * })
 */
Player.moved = PlayerEvents.Moved;
Player.playerId = 0;
