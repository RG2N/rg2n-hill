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
const events_1 = require("events");
const Game_1 = __importDefault(require("./Game"));
const brickIds_1 = __importDefault(require("../net/BrickHillPackets/brickIds"));
const Vector3_1 = __importDefault(require("./Vector3"));
const TOUCH_EVENTS = ["touching", "touchingEnded"];
/**
 * This is used for creating brick objects in Brick Hill.
 *
 * Example of a brick that can kill players:
 * @example
 * ```js
 * let brick = new Brick(new Vector3(0, 0, 0), new Vector3(5, 5, 5), "#f54242")
 * brick.visibility = 0.5
 *
 * Game.newBrick(brick) // "Parent" the brick to the game so players will download it.
 *
 * brick.touching(debounce((p) => {
 *      p.kill()
 * }, 500)) // We add a debounce of half a second to prevent double hits.
 */
class Brick extends events_1.EventEmitter {
    constructor(position = new Vector3_1.default(0, 0, 0), scale = new Vector3_1.default(1, 1, 1), color = "#C0C0C0") {
        super();
        /** If enabled, the brick will emit lighting. */
        this.lightEnabled = false;
        /** The current light color (in hex) of the brick. */
        this.lightColor = "#000000";
        /** The range of the brick's lighting. */
        this.lightRange = 5;
        /** The visibility of the brick. (1 = fully visible, 0 = invisible)*/
        this.visibility = 0;
        /** If the brick is passable by other players. */
        this.collision = true;
        /** Whether or not the brick is a clickable brick. */
        this.clickable = false;
        /** The minimum distance a player must be to click the brick (if it is a clickable brick). */
        this.clickDistance = 50;
        Brick.brickId += 1;
        this.destroyed = false;
        this._steps = [];
        this.position = position;
        this.scale = scale;
        this.color = color;
        this.lightColor = "#000000";
        this.lightRange = 5;
        this.visibility = 1;
        this.netId = Brick.brickId;
        this.collision = true;
        this.lightEnabled = false;
        this._playersTouching = new Set();
        this._hitMonitorSpeed = 100;
        this._hitMonitorActive = false;
        this.on("newListener", (event) => {
            if (!TOUCH_EVENTS.includes(event))
                return;
            if (!this._hitMonitorActive) {
                this._detectTouching();
                this._hitMonitorActive = true;
            }
        });
        this.on("removeListener", (event) => {
            if (event !== "touching")
                return;
            if (this.listenerCount("touching"))
                return;
            clearInterval(this._hitMonitor);
            this._hitMonitorActive = false;
        });
    }
    get center() {
        return new Vector3_1.default(this.position.x + this.scale.x / 2, this.position.y + this.scale.y / 2, this.position.z + this.scale.z / 2);
    }
    setPosition(position) {
        return __awaiter(this, void 0, void 0, function* () {
            this.position = new Vector3_1.default().fromVector(position);
            return yield (0, brickIds_1.default)(this, "pos");
        });
    }
    setScale(scale) {
        return __awaiter(this, void 0, void 0, function* () {
            this.scale = new Vector3_1.default().fromVector(scale);
            return yield (0, brickIds_1.default)(this, "scale");
        });
    }
    setRotation(rot) {
        return __awaiter(this, void 0, void 0, function* () {
            this.rotation = rot;
            return yield (0, brickIds_1.default)(this, "rot");
        });
    }
    setModel(model) {
        return __awaiter(this, void 0, void 0, function* () {
            this.model = model;
            return yield (0, brickIds_1.default)(this, "model");
        });
    }
    setColor(color) {
        return __awaiter(this, void 0, void 0, function* () {
            this.color = color;
            return yield (0, brickIds_1.default)(this, "col");
        });
    }
    setLightColor(color) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.lightEnabled)
                return Promise.reject("brick.lightEnabled must be enabled first!");
            this.lightColor = color;
            return yield (0, brickIds_1.default)(this, "lightcol");
        });
    }
    setLightRange(range) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.lightEnabled)
                return Promise.reject("brick.lightEnabled must be enabled first!");
            this.lightRange = range;
            return yield (0, brickIds_1.default)(this, "lightrange");
        });
    }
    setVisibility(visibility) {
        return __awaiter(this, void 0, void 0, function* () {
            this.visibility = visibility;
            return yield (0, brickIds_1.default)(this, "alpha");
        });
    }
    setCollision(collision) {
        return __awaiter(this, void 0, void 0, function* () {
            this.collision = collision;
            return yield (0, brickIds_1.default)(this, "collide");
        });
    }
    setClickable(clickable, clickDistance = 50) {
        return __awaiter(this, void 0, void 0, function* () {
            this.clickable = clickable;
            if (clickDistance)
                this.clickDistance = clickDistance;
            return yield (0, brickIds_1.default)(this, "clickable");
        });
    }
    /**
     * Identical to setInterval, but will be cleared after the brick is destroyed.
     * Use this if you want to attach loops to bricks, but don't want to worry about clearing them after they're destroyed.
     * @param callback The callback function.
     * @param delay The delay in milliseconds.
     */
    setInterval(callback, delay) {
        const loop = setInterval(callback, delay);
        this._steps.push(loop);
        return loop;
    }
    clone() {
        const newBrick = new Brick(new Vector3_1.default().fromVector(this.position), new Vector3_1.default().fromVector(this.scale), this.color);
        newBrick.name = this.name;
        newBrick.lightColor = this.lightColor;
        newBrick.clickable = this.clickable;
        newBrick.clickDistance = this.clickDistance;
        newBrick.visibility = this.visibility;
        newBrick.collision = this.collision;
        newBrick.rotation = this.rotation;
        newBrick.lightEnabled = this.lightEnabled;
        newBrick.lightColor = this.lightColor;
        newBrick.lightRange = this.lightRange;
        newBrick.model = this.model;
        newBrick.clickable = this.clickable;
        newBrick.clickDistance = this.clickDistance;
        newBrick.shape = this.shape;
        return newBrick;
    }
    _cleanup() {
        clearInterval(this._hitMonitor);
        this.removeAllListeners();
        this._steps.forEach((loop) => clearInterval(loop));
    }
    destroy() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.destroyed)
                return Promise.reject("Brick has already been destroyed.");
            this._cleanup();
            // This is not a local brick,
            if (!this.socket) {
                const bricks = Game_1.default.world.bricks;
                const index = bricks.indexOf(this);
                if (index !== -1)
                    bricks.splice(index, 1);
                // This is a local brick
            }
            else {
                const locals = this.socket.player.localBricks;
                const index = locals.indexOf(this);
                if (index !== -1)
                    locals.splice(index, 1);
            }
            yield (0, brickIds_1.default)(this, "destroy");
            this.socket = null;
            this.netId = null;
            this._playersTouching = new Set();
            this.destroyed = true;
        });
    }
    _hitDetection() {
        const scale = [];
        const origin = [];
        scale[0] = this.scale.x / 2;
        scale[1] = this.scale.y / 2;
        scale[2] = this.scale.z / 2;
        origin[0] = this.position.x + scale[0];
        origin[1] = this.position.y + scale[1];
        origin[2] = this.position.z + scale[2];
        const players = (this.socket && [this.socket.player]) || Game_1.default.players;
        for (const p of players) {
            const size = [];
            size[0] = p.scale.x;
            size[1] = p.scale.y;
            size[2] = 5 * p.scale.z / 2;
            const center = [];
            center[0] = p.position.x;
            center[1] = p.position.y;
            center[2] = p.position.z + size[2];
            let touched = true;
            for (let i = 0; i < 3; i++) {
                const dist = Math.abs(origin[i] - center[i]);
                const close = size[i] + scale[i];
                if (dist >= close + 0.4) {
                    touched = false;
                }
            }
            if (touched && p.alive) {
                this._playersTouching.add(p);
                this.emit("touching", p);
            }
            if (this._playersTouching.has(p) && (!touched || !p.alive)) {
                this._playersTouching.delete(p);
                this.emit("touchingEnded", p);
            }
        }
    }
    /**
    * Calls the specified callback when a player clicks the brick.
    * @callback
    * @example
    * ```js
    * const purpleBrick = world.bricks.find(brick => brick.name === 'purpleBrick')
    *
    * purpleBrick.clicked((player, secure) => {
    *   if (!secure) return // The server has validated that the player is currently *near* the brick.
    *   console.log(player.username + " clicked this brick!")
    * })
    * ```
    */
    clicked(callback) {
        if (!this.clickable)
            this.setClickable(true, this.clickDistance);
        const clickEvent = (p) => {
            let secure = false;
            if ((Math.pow(this.position.x - p.position.x, 2) +
                Math.pow(this.position.y - p.position.y, 2) +
                Math.pow(this.position.z - p.position.z, 2)) <= this.clickDistance)
                secure = true;
            callback(p, secure);
        };
        this.on("clicked", clickEvent);
        return {
            disconnect: () => {
                this.off("clicked", clickEvent);
                this.setClickable(false);
                return null;
            }
        };
    }
    /**
    * Calls the specified callback when a player (who previously touched the brick) steps off of it. \
    * This will fire even if the player dies while touching the brick.
    *
    * However, if the player leaves the game this will *NOT* fire.
    * @callback
    * @example
    * ```js
    * const purpleBrick = world.bricks.find(brick => brick.name === 'purpleBrick')
    *
    * purpleBrick.touchingEnded((player) => {
    *   console.log("Get back on that brick!")
    * })
    * ```
    */
    touchingEnded(callback) {
        const touchEvent = (p) => {
            callback(p);
        };
        this.on("touchingEnded", touchEvent);
        return {
            disconnect: () => this.off("touchingEnded", touchEvent)
        };
    }
    /**
    * Calls the specified callback with the player who touched the brick.
    * @callback
    * @example
    * ```js
    * const purpleBrick = world.bricks.find(brick => brick.name === "purpleBrick")
    *
    * purpleBrick.touching((player) => {
    *   player.kill()
    * })
    * ```
    */
    touching(callback) {
        const touchEvent = (p) => {
            callback(p);
        };
        this.on("touching", touchEvent);
        return {
            disconnect: () => this.off("touching", touchEvent)
        };
    }
    _detectTouching() {
        this._hitMonitor = setInterval(() => {
            // Release the reference to the player to prevent memory leaks.
            for (const p of this._playersTouching) {
                if (p.destroyed) {
                    this._playersTouching.delete(p);
                }
            }
            if (!Game_1.default.players.length)
                return;
            this._hitDetection();
        }, this._hitMonitorSpeed);
    }
    /**
     * Checks if this brick is colliding with another
     * @param brick The brick used to check collision against
     */
    intersects(brick) {
        return (this.position.x <= brick.position.x + brick.scale.x && this.position.x + this.scale.x >= brick.position.x) &&
            (this.position.y <= brick.position.y + brick.scale.y && this.position.y + this.scale.y >= brick.position.y) &&
            (this.position.z <= brick.position.z + brick.scale.z && this.position.z + this.scale.z >= brick.position.z);
    }
}
exports.default = Brick;
Brick.brickId = 0;
