var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const Game = require("../../class/Game").default;
const PacketBuilder = require("../../net/PacketBuilder").default;
const { hexToDec } = require("../../util/color/colorModule").default;
// Used for converting camelCase to Brick Hill's weird way of doing it.
const BRICK_HILL_ENVIRONMENTS = {
    "ambient": "Ambient",
    "skyColor": "Sky",
    "baseColor": "BaseCol",
    "baseSize": "BaseSize",
    "sunIntensity": "Sun"
};
// Brick Hill weather names
const BRICK_HILL_WEATHER = {
    "snow": "WeatherSnow",
    "rain": "WeatherRain",
    "sun": "WeatherSun"
};
function setEnvironment(environment = {}, socket) {
    return __awaiter(this, void 0, void 0, function* () {
        const env_keys = Object.keys(environment);
        for (const key of env_keys) {
            if (typeof Game.world.environment[key] === "undefined") {
                return Promise.reject("Invalid environment property: " + key);
            }
        }
        const promises = [];
        for (const prop of env_keys) {
            const packet = new PacketBuilder("PlayerModification");
            let change = environment[prop];
            if (!socket)
                Game.world.environment[prop] = change;
            if (prop === "weather") {
                const weather = BRICK_HILL_WEATHER[change];
                if (!weather)
                    return Promise.reject("Invalid weather type (options: sun, rain, snow)");
                packet.write("string", weather);
            }
            else {
                switch (prop) {
                    case "ambient": {
                        change = hexToDec(change, true);
                        break;
                    }
                    case "baseColor": {
                        change = hexToDec(change, true);
                        break;
                    }
                    case "skyColor": {
                        change = hexToDec(change);
                        break;
                    }
                }
                packet.write("string", BRICK_HILL_ENVIRONMENTS[prop]);
                packet.write("uint32", change);
            }
            if (socket) { // A socket was specified, this is a local change.
                promises.push(packet.send(socket));
            }
            else {
                promises.push(packet.broadcast());
            }
        }
        return Promise.all(promises);
    });
}
module.exports = setEnvironment;
