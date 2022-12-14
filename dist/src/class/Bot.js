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
const events_1 = require("events");
const Game_1 = __importDefault(require("./Game"));
const Vector3_1 = __importDefault(require("./Vector3"));
const PacketBuilder_1 = __importStar(require("../net/PacketBuilder"));
const botIds_1 = __importDefault(require("../net/BrickHillPackets/botIds"));
const assetIds_1 = __importDefault(require("../net/BrickHillPackets/assetIds"));
const setAvatar_1 = __importDefault(require("../scripts/player/setAvatar"));
/**
 * Bots are fake players that player's can interact with. \
 * ![](https://cdn.discordapp.com/attachments/601268924251897856/655963821776830474/lhE5I4W_-_Imgur.gif)
 *
 * You can do many things with them, and they even have very primitive AI capabilities.
 *
 * An example of a zombie that can chase and kill players:
* ```js
* const zombie = new Bot("Zombie")
*
* const outfit = new Outfit()
*   .body("#0d9436")
*   .torso("#694813")
*   .rightLeg("#694813")
*   .leftLeg("#694813")
*
* zombie.setOutfit(outfit)
*
* Game.newBot(zombie)
*
* // We use bot.setinterval so that when the zombie is destroyed, the loop clears.
* // It's good practice to do this to avoid memory leaks.
* zombie.setInterval(() => {
*   let target = zombie.findClosestPlayer(20)
*
*   if (!target) return zombie.setSpeech("")
*
*   zombie.setSpeech("BRAAINNNSSS!")
*
*   zombie.moveTowardsPlayer(target, 8)
* }, 10)
*
* let touchEvent = zombie.touching((p) => {
*   Game.messageAll(`[#ff0000]${p.username} was eaten by a zombie!`)
*   p.kill()
* })
* ```
**/
class Bot extends events_1.EventEmitter {
    constructor(name) {
        super();
        /** The speech bubble of the bot. ("" = empty). */
        this.speech = "";
        this.position = new Vector3_1.default(0, 0, 0);
        this.rotation = new Vector3_1.default(0, 0, 0);
        this.scale = new Vector3_1.default(1, 1, 1);
        Bot.botId += 1;
        this._steps = [];
        this.destroyed = false;
        this.name = name;
        this.netId = Bot.botId;
        this.speech = "";
        // Positioning
        this.position = new Vector3_1.default(0, 0, 0);
        this.rotation = new Vector3_1.default(0, 0, 0);
        // Scale
        this.scale = new Vector3_1.default(1, 1, 1);
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
        this.on("newListener", (event) => {
            if (event !== "touching")
                return;
            this._detectTouching();
        });
        this.on("removeListener", (event) => {
            if (event !== "touching")
                return;
            if (this.listenerCount("touching"))
                return;
            clearInterval(this._hitMonitor);
        });
    }
    /** Remove the bot from Game.world, \
     * clear all event listeners, \
     * stop hit detection, \
     * and tell clients to delete the bot. */
    destroy() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.destroyed)
                return Promise.reject("Bot has already been destroyed.");
            const bots = Game_1.default.world.bots;
            // Stop monitoring for hit detection
            clearInterval(this._hitMonitor);
            this._steps.forEach((loop) => {
                clearInterval(loop);
            });
            this.removeAllListeners();
            const index = bots.indexOf(this);
            if (index !== -1)
                bots.splice(index, 1);
            yield new PacketBuilder_1.default(PacketBuilder_1.PacketEnums.DestroyBot)
                .write("uint32", this.netId)
                .broadcast();
            this.netId = undefined;
            this.destroyed = true;
        });
    }
    /**
 * Identical to setInterval, but will be cleared after the bot is destroyed.
 * Use this if you want to attach loops to bots, but don't want to worry about clearing them after they're destroyed.
 * @param callback The callback function.
 * @param delay The delay in milliseconds.
 */
    setInterval(callback, delay) {
        const loop = setInterval(callback, delay);
        this._steps.push(loop);
        return loop;
    }
    /** Set the position of the bot. */
    setPosition(position) {
        return __awaiter(this, void 0, void 0, function* () {
            this.position = new Vector3_1.default().fromVector(position);
            return (0, botIds_1.default)(this, "BCDG");
        });
    }
    /** Set the rotation of the bot. */
    setRotation(rotation) {
        return __awaiter(this, void 0, void 0, function* () {
            this.rotation = new Vector3_1.default().fromVector(rotation);
            return (0, botIds_1.default)(this, "EFG");
        });
    }
    /** Set the scale of the bot. */
    setScale(scale) {
        return __awaiter(this, void 0, void 0, function* () {
            this.scale = new Vector3_1.default().fromVector(scale);
            return (0, botIds_1.default)(this, "HIJ");
        });
    }
    /** Set the speech of the bot. */
    setSpeech(speech) {
        return __awaiter(this, void 0, void 0, function* () {
            this.speech = speech;
            return (0, botIds_1.default)(this, "X");
        });
    }
    setOutfit(outfit) {
        return __awaiter(this, void 0, void 0, function* () {
            const promises = [];
            // Patch assets + colors
            Object.assign(this.assets, outfit.assets);
            Object.assign(this.colors, outfit.colors);
            promises.push((0, botIds_1.default)(this, "KLMNOP"), (0, assetIds_1.default)(this, outfit.idString, "Bot").then(b => b.broadcast()));
            return Promise.all(promises);
        });
    }
    /** Sets the bot's z rotation to the point provided. */
    lookAtPoint(position) {
        return __awaiter(this, void 0, void 0, function* () {
            let angle = Math.atan2(position.y - this.position.y, position.x - this.position.x);
            angle = -(angle * (180 / Math.PI)) + 270;
            this.rotation.z = angle;
            yield (0, botIds_1.default)(this, "G");
            return angle;
        });
    }
    /** Turns the bot to face the player provided. */
    lookAtPlayer(player) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.lookAtPoint(player.position);
        });
    }
    /** Moves the bot to the point provided. */
    moveTowardsPoint(pos, speed = 5) {
        return __awaiter(this, void 0, void 0, function* () {
            speed *= 0.01;
            const angle = Math.atan2(pos.y - this.position.y, pos.x - this.position.x);
            const rot = -(angle * (180 / Math.PI)) + 270;
            this.position.x += Math.cos(angle) * speed;
            this.position.y += Math.sin(angle) * speed;
            this.rotation.z = rot;
            return (0, botIds_1.default)(this, "BCDG");
        });
    }
    /** Moves the bot towards the player. */
    moveTowardsPlayer(player, speed) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.moveTowardsPoint(player.position, speed);
        });
    }
    /** Returns the closest player to the bot, or null. */
    findClosestPlayer(minDist) {
        let target;
        for (const player of Game_1.default.players) {
            if (player.destroyed || !player.alive)
                continue; // Don't go after dead players
            const dist = Game_1.default.pointDistance3D(player.position, this.position);
            if (dist <= minDist) {
                minDist = dist;
                target = player;
            }
        }
        return target;
    }
    /** Sets the bots avatar to a provided userId. */
    setAvatar(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, setAvatar_1.default)(this, userId);
            return (0, botIds_1.default)(this, "KLMNOPQUVWRST");
        });
    }
    /** Starts hit detection for the bot. */
    touching(callback) {
        const touchEvent = (p) => {
            callback(p);
        };
        this.on("touching", touchEvent);
        return {
            disconnect: () => this.off("command", touchEvent)
        };
    }
    _detectTouching() {
        this._hitMonitor = setInterval(() => {
            if (!Game_1.default.players.length)
                return;
            for (const player of Game_1.default.players) {
                if (!player.destroyed && player.alive) {
                    if (Game_1.default.pointDistance3D(player.position, this.position) <= 2)
                        this.emit("touching", player);
                }
            }
        }, 100);
    }
}
exports.default = Bot;
Bot.botId = 0;
