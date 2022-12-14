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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = exports.GameEvents = exports.Weather = void 0;
const path_1 = require("path");
const events_1 = require("events");
const package_json_1 = require("../../package.json");
/** Weather types. */
var Weather;
(function (Weather) {
    Weather["Sun"] = "sun";
    Weather["Rain"] = "rain";
    Weather["Snow"] = "snow";
})(Weather = exports.Weather || (exports.Weather = {}));
var GameEvents;
(function (GameEvents) {
    GameEvents["InitialSpawn"] = "initialSpawn";
    GameEvents["PlayerJoin"] = "playerJoin";
    GameEvents["PlayerLeave"] = "playerLeave";
    GameEvents["Chatted"] = "chatted";
    GameEvents["Chat"] = "chat";
})(GameEvents = exports.GameEvents || (exports.GameEvents = {}));
class Game extends events_1.EventEmitter {
    constructor() {
        super();
        /**
         * This property is to compensate for a client bug. If the player team is
         * not set automatically, the user's name won't appear on their client's leaderboard.
         *
         * Only disable this if you are going to set the player's team when they join.
         */
        this.assignRandomTeam = true;
        /** If set to false, players will not spawn in the game. */
        this.playerSpawning = true;
        /** If set to false, the bricks of the map will not be sent to the player when they join. But they will still be loaded into memory. */
        this.sendBricks = true;
        /** If set to false server join messages, etc will not be sent to players. */
        this.systemMessages = true;
        this.newBricks = this.loadBricks;
        this.players = [];
        this.banNonClientTraffic = true;
        this.version = package_json_1.version;
        this.disabledCoreScripts = [];
        this.modules = {};
        this.assignRandomTeam = true;
        this.sendBricks = true;
        this.playerSpawning = true;
        this.systemMessages = true;
        this.MOTD = `[#14d8ff][NOTICE]: This server is proudly hosted with RGsFramework 1.0.0.`;
        this.world = {
            environment: {
                ambient: "#000000",
                skyColor: "#71b1e6",
                baseColor: "#248233",
                baseSize: 100,
                sunIntensity: 400,
                weather: Weather.Sun
            },
            teams: [],
            bricks: [],
            tools: [],
            spawns: [],
            bots: []
        };
    }
    /**
     * Returns player stats in JSON from this API: \
     * https://api.brick-hill.com/v1/user/profile?id={userId}
     *
    */
    getUserInfo(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return scripts.getUserInfo(userId);
        });
    }
    /** Sends a chat message to every player in the game. */
    messageAll(message) {
        return __awaiter(this, void 0, void 0, function* () {
            return scripts.message.messageAll(message);
        });
    }
    topPrintAll(message, seconds) {
        return __awaiter(this, void 0, void 0, function* () {
            return scripts.topPrintAll(message, seconds);
        });
    }
    centerPrintAll(message, seconds) {
        return __awaiter(this, void 0, void 0, function* () {
            return scripts.centerPrintAll(message, seconds);
        });
    }
    bottomPrintAll(message, seconds) {
        return __awaiter(this, void 0, void 0, function* () {
            return scripts.bottomPrintAll(message, seconds);
        });
    }
    /**
    * Commands are sent from the client when a user prefixes their message with `/` followed by any string. \
    * In the example below, "kick" would be the command, and "user" the argument: \
    * **Example**: `/kick user`
    * @callback
    * @example
    * ```js
    * Game.command("kick", (caller, args) => {
    *   if (caller.userId !== 2760) return // You're not dragonian!
    *   for (let player of Game.players) {
    *       if (player.username.startsWith(args)) {
    *           return player.kick("Kicked by Dragonian!")
    *       }
    *   }
    * })
    * ```
    */
    command(gameCommand, validator, callback) {
        const cmd = (cmd, p, args) => {
            if (cmd === gameCommand) {
                validator(p, args, callback);
            }
        };
        this.on("command", cmd);
        return {
            disconnect: () => this.off("command", cmd)
        };
    }
    /**
     * Identical to Game.command, but instead of a string it takes an array of commands.
     *
     * This will assign them all to the same callback, this is very useful for creating alias commands.
     * @see {@link command}
     * @example
     * ```js
     * Game.commands(["msg", "message"], (p, args) => {
     *      Game.messageAll(args)
     * })
     * ```
     */
    commands(gameCommand, validator, callback) {
        const cmd = (cmd, p, args) => {
            if (gameCommand.includes(cmd)) {
                validator(p, args, callback);
            }
        };
        this.on("command", cmd);
        return {
            disconnect: () => this.off("command", cmd)
        };
    }
    /** Returns the data for provided setId. **/
    getSetData(setId) {
        return __awaiter(this, void 0, void 0, function* () {
            return scripts.getSetData(setId);
        });
    }
    /** "Parents" a bot class to the game. **/
    newBot(bot) {
        return __awaiter(this, void 0, void 0, function* () {
            this.world.bots.push(bot);
            const botPacket = yield scripts.botPacket(bot);
            return botPacket.broadcast();
        });
    }
    newTool(tool) {
        return __awaiter(this, void 0, void 0, function* () {
            this.world.tools.push(tool);
            const toolPacket = yield scripts.toolPacket.create(tool);
            return toolPacket.broadcast();
        });
    }
    /** "Parents" a brick class to the game. You should do this after setting all the brick properties. */
    newBrick(brick) {
        return __awaiter(this, void 0, void 0, function* () {
            this.world.bricks.push(brick);
            const packet = yield scripts.loadBricks([brick]);
            return packet.broadcast();
        });
    }
    /** Takes an array of bricks, and deletes them all from every client. This will modify world.bricks. */
    deleteBricks(bricks) {
        return __awaiter(this, void 0, void 0, function* () {
            const deletePacket = scripts.deleteBricks(bricks);
            for (const brick of bricks) {
                brick._cleanup();
                const index = this.world.bricks.indexOf(brick);
                if (index !== -1)
                    this.world.bricks.splice(index, 1);
            }
            return deletePacket.broadcast();
        });
    }
    /** Takes an array of teams and loads them to all clients.
     * @example
     * ```js
     * let teams = {
     *  redTeam: new Team("Red Team", "#f54242"),
     *  blueTeam: new Team("Blue Team", "#0051ff")
     * }
     *
     * Game.newTeams(Object.values(teams))
     * ```
     */
    newTeams(teams) {
        this.world.teams = this.world.teams.concat(teams);
        for (const team of teams) {
            scripts.teamPacket.create(team)
                .broadcast();
        }
    }
    newTeam(team) {
        return __awaiter(this, void 0, void 0, function* () {
            this.world.teams.push(team);
            return scripts.teamPacket.create(team)
                .broadcast();
        });
    }
    /** Takes an array of bricks and loads them to all clients. */
    loadBricks(bricks) {
        return __awaiter(this, void 0, void 0, function* () {
            this.world.bricks = this.world.bricks.concat(bricks);
            const brickPacket = yield scripts.loadBricks(bricks);
            return brickPacket.broadcast();
        });
    }
    /**
     * Sets the environment for every player in the game.
     *
     * Patches the world.environment with keys containing new properties.
     *
     * @example
     * ```js
     * Game.setEnvironment({ baseSize: 500 })
     * ```
     */
    setEnvironment(environment) {
        return __awaiter(this, void 0, void 0, function* () {
            return scripts.setEnvironment(environment);
        });
    }
    /**
     * Clears the map, and then calls loadBrk with the provided brk name.
     * Then it sets all the bricks in the game, spawns, and Game.map.
     *
     * MapData: bricks, spawns, environment, tools, teams, etc is returned.
     *
     * @example
     * ```js
     * setTimeout(async() => {
     *      // Load all bricks + spawns in the game
     *      let data = await Game.loadBrk("headquarters2.brk")
     *
     *      // Set the environment details (loadBrk does not do this).
     *      Game.setEnvironment(data.environment)
     *
     *      // This brk added spawns, let's respawn players so they aren't trapped in a brick.
     *      Game.players.forEach((player) => {
     *          player.respawn()
     *      })
     *
     *      console.log(data)
     * }, 60000)
     */
    loadBrk(location) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.mapDirectory)
                throw new Error('Cannot use loadBrk without mapDirectory.');
            const mapDirectory = (0, path_1.resolve)(this.mapDirectory);
            const brkFile = (0, path_1.join)(mapDirectory, location);
            if (brkFile.indexOf(mapDirectory) !== 0)
                throw new Error('Cannot load .brk outside of map folder.');
            if (!brkFile.endsWith(".brk"))
                throw new Error("Map selected is not a .brk file. Aborting.");
            this.map = (0, path_1.basename)(brkFile);
            yield this.clearMap();
            const brkData = yield scripts.loadBrk(brkFile);
            this.world.bricks = brkData.bricks;
            this.world.spawns = brkData.spawns;
            const map = yield scripts.loadBricks(this.world.bricks);
            if (map)
                yield map.broadcast();
            return brkData;
        });
    }
    /**
     * Loads the brk file like Game.loadBrk, but returns the data rather than setting / modifying anything.
     *
     * This is useful if you want to grab teams, bricks, etc from a brk, but don't want to modify the game yet.
     */
    parseBrk(location) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.mapDirectory)
                throw new Error('Cannot use parseBrk without mapDirectory.');
            const mapDirectory = (0, path_1.resolve)(this.mapDirectory);
            const brkFile = (0, path_1.join)(mapDirectory, location);
            if (brkFile.indexOf(mapDirectory) !== 0)
                throw new Error('Cannot parse .brk outside of map folder.');
            if (!brkFile.endsWith(".brk"))
                throw new Error("Map selected is not a .brk file. Aborting.");
            return scripts.loadBrk(brkFile);
        });
    }
    /**
     * Clears all of the bricks for every player connected. This wipes world.bricks, any new players who
     * join after this is ran will download no bricks from the server.
     */
    clearMap() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const brick of this.world.bricks)
                brick._cleanup();
            this.world.bricks = [];
            return new PacketBuilder_1.default(PacketBuilder_1.PacketEnums.ClearMap)
                .write("bool", true) // There's a bug with packets that contain no data.
                .broadcast();
        });
    }
    bindToClose(callback) {
        let ended = false;
        const processExit = () => __awaiter(this, void 0, void 0, function* () {
            ended = true;
            yield callback();
            process.exit();
        });
        process.on("SIGINT", processExit);
        process.on("SIGTERM", processExit);
        process.on("exit", () => {
            if (!ended)
                callback();
        });
    }
    /**
     * Exits the server process, and terminates any running scripts.
     * @see {@link https://nodejs.org/api/process.html#process_process_exit_code} for more information.
    */
    shutdown(status = 0) {
        return process.exit(status);
    }
    /** Return the distance between two points. */
    pointDistance3D(p1, p2) {
        // ((x2 - x1)^2 + (y2 - y1)^2 + (z2 - z1)^2)^1/2
        return Math.sqrt((Math.pow(p1.x - p2.x, 2)) + (Math.pow(p1.y - p2.y, 2)) + (Math.pow(p1.z - p2.z, 2)));
    }
    /**@hidden */
    _newPlayer(p) {
        return __awaiter(this, void 0, void 0, function* () {
            p.socket.player = p;
            p.authenticated = true;
            this.players.push(p);
            this.emit("playerJoin", p);
            yield p._joined().catch(console.error);
            this.emit("initialSpawn", p);
        });
    }
    /**@hidden */
    _playerLeft(p) {
        return __awaiter(this, void 0, void 0, function* () {
            if (p.authenticated) {
                const index = this.players.indexOf(p);
                this.players.splice(index, 1);
                this.emit("playerLeave", p);
                yield p._left();
            }
        });
    }
}
exports.Game = Game;
/**
* Identical to player.on("initialSpawn").
* @event
* @example
* ```js
* Game.on("initialSpawn", (player) => {
*    // "player" is now fully loaded.
* })
* ```
*/
Game.initialSpawn = GameEvents.InitialSpawn;
/**
* Fires immediately whenever a player joins the game. (Before player downloads bricks, players, assets, etc).
* @event
* @param player [Player]{@link Player}
* @example
* ```js
* Game.on("playerJoin", (player) => {
*    console.log("Hello: " + player.username)
* })
* ```
*/
Game.playerJoin = GameEvents.PlayerJoin;
/**
* Fires whenever a player leaves the game.
* @event
* @param player [Player]{@link Player}
* @example
* ```js
* Game.on("playerLeave", (player) => {
*    console.log("Goodbye: " + player.username)
* })
* ```
*/
Game.playerLeave = GameEvents.PlayerLeave;
/**
* Fires whenever any player chats in the game.
* @event
* @param player [Player]{@link Player}
* @param message Message
* @example
* ```js
* Game.on("chatted", (player, message) => {
*    console.log(message)
* })
* ```
*/
Game.chatted = GameEvents.Chatted;
/**
* If a `Game.on("chat")` listener is added, any time the game recieves a chat message, it will be emitted data to this listener, and
* the actual packet for sending the chat will not be sent.
*
* You can use this to intercept chat messages, and then transform them to whatever, and then call `Game.messageAll`.
* @event
* @param player [Player]{@link Player}
* @param message Message
* @example
* ```js
* Game.on("chat", (player, message) => {
*    Game.messageAll(player.username + " screams loudly: " + message)
* })
* ```
*/
Game.chat = GameEvents.Chat;
const GameObject = new Game();
exports.default = GameObject;
__exportStar(require("./Player"), exports);
const scripts = __importStar(require("../scripts"));
const PacketBuilder_1 = __importStar(require("../net/PacketBuilder"));
