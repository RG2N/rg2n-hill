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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zlib = __importStar(require("zlib"));
const Brick_1 = __importDefault(require("../../class/Brick"));
const Vector3_1 = __importDefault(require("../../class/Vector3"));
const DEFAULT_BRICK = new Brick_1.default();
/**A module used for serializing bricks into a storeable-data format.
 *
 * Can be used for saving user build creations.
 *
 * @example
 * ```js
 * const MAP_DATABASE = new Enmap({
 *       name: "mapBuffer",
 *       autoFetch: true,
 *       fetchAll: false
 *   });
 *
 *   // Save the data if it isn't already saved.
 *   if (!MAP_DATABASE.has("mapBuffer")) {
 *       console.log("Map not found, saving it ...")
 *
 *       let { bricks } = Game.parseBrk("./maps/headquarters2.brk")
 *
 *       let data = util.serialize.serialize(bricks)
 *
 *       MAP_DATABASE.set("mapBuffer", data)
 *   }
 *
 *   // Clear the map
 *   Game.clearMap()
 *
 *   Game.on("initialSpawn", (p) => {
 *       let mapData = Buffer.from(MAP_DATABASE.get("mapBuffer"))
 *
 *       mapData = util.serialize.deserialize(mapData)
 *
 *       p.loadBricks(mapData)
 *   })
 *   ```
 */
function serialize(bricks) {
    let binaryData = [];
    bricks.forEach((brick) => {
        const data = {};
        if (!brick.position.equalsVector(DEFAULT_BRICK.position))
            data.position = [brick.position.x, brick.position.y, brick.position.z];
        if (!brick.scale.equalsVector(DEFAULT_BRICK.scale))
            data.scale = [brick.scale.x, brick.scale.y, brick.scale.z];
        if (brick.color !== DEFAULT_BRICK.color)
            data.color = brick.color;
        if (brick.visibility < 1)
            data.visibility = brick.visibility;
        if (!brick.collision)
            data.collision = false;
        if (brick.name)
            data.name = brick.name;
        if (brick.rotation)
            data.rotation = brick.rotation;
        if (brick.model)
            data.model = brick.model;
        if (brick.lightEnabled) {
            data.lightEnabled = true;
            data.lightColor = brick.lightColor;
            data.lightrange = brick.lightRange;
        }
        if (brick.clickable) {
            data.clickable = true;
            data.clickDistance = brick.clickDistance;
        }
        binaryData.push(data);
    });
    binaryData = JSON.stringify(binaryData);
    binaryData = zlib.deflateSync(binaryData);
    return binaryData;
}
function deserialize(data) {
    data = zlib.inflateSync(data);
    data = JSON.parse(data.toString("ascii"));
    const bricks = [];
    data.forEach((brick) => {
        const newBrick = new Brick_1.default(brick.position, brick.scale, brick.color);
        Object.keys(brick).forEach((prop) => {
            // Convert objects into Vector3s
            if (typeof brick[prop] === "object")
                brick[prop] = new Vector3_1.default(...brick[prop]);
            newBrick[prop] = brick[prop];
        });
        bricks.push(newBrick);
    });
    return bricks;
}
exports.default = { serialize, deserialize };
