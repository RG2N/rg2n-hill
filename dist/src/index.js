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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
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
exports.startServer = exports.KeyTypes = exports.PacketEnums = exports.PacketBuilder = exports.ToolEvents = exports.Tool = exports.Bot = exports.Vector3 = exports.Outfit = exports.Brick = exports.Team = exports.Player = void 0;
// Node + npm modules
const path_1 = require("path");
const util_1 = require("util");
const vm2_1 = require("vm2");
const fs = __importStar(require("fs"));
const glob_1 = __importDefault(require("glob"));
// Have to use require here because phin doesn't support .defaults with TS
const phin = require("phin")
    .defaults({ "parse": "json", "timeout": 12000 });
// VM Classes
const Game_1 = __importDefault(require("./class/Game"));
const Team_1 = __importDefault(require("./class/Team"));
const Brick_1 = __importDefault(require("./class/Brick"));
const Bot_1 = __importDefault(require("./class/Bot"));
const PacketBuilder_1 = __importDefault(require("./net/PacketBuilder"));
const Vector3_1 = __importDefault(require("./class/Vector3"));
const scripts_1 = require("./scripts");
const Tool_1 = __importDefault(require("./class/Tool"));
const Outfit_1 = __importDefault(require("./class/Outfit"));
// Utility methods
const colorModule_1 = __importDefault(require("./util/color/colorModule"));
const filterModule_1 = __importDefault(require("./util/filter/filterModule"));
const serializerModule_1 = __importDefault(require("./util/serializer/serializerModule"));
const chatModule_1 = __importDefault(require("./util/chat/chatModule"));
// Bundler
const lib_1 = require("nh-bundle/lib");
const AssetDownloader_1 = __importDefault(require("./class/AssetDownloader"));
const Sanction_1 = __importDefault(require("./class/Sanction"));
const NPM_LATEST_VERSION = "https://registry.npmjs.org/node-hill/latest";
const CORE_DIRECTORY = (0, path_1.resolve)(__dirname, "./core_scripts");
// Typedoc exports
__exportStar(require("./class/Game"), exports);
var Player_1 = require("./class/Player");
Object.defineProperty(exports, "Player", { enumerable: true, get: function () { return __importDefault(Player_1).default; } });
var Team_2 = require("./class/Team");
Object.defineProperty(exports, "Team", { enumerable: true, get: function () { return __importDefault(Team_2).default; } });
var Brick_2 = require("./class/Brick");
Object.defineProperty(exports, "Brick", { enumerable: true, get: function () { return __importDefault(Brick_2).default; } });
var Outfit_2 = require("./class/Outfit");
Object.defineProperty(exports, "Outfit", { enumerable: true, get: function () { return __importDefault(Outfit_2).default; } });
var Vector3_2 = require("./class/Vector3");
Object.defineProperty(exports, "Vector3", { enumerable: true, get: function () { return __importDefault(Vector3_2).default; } });
var Bot_2 = require("./class/Bot");
Object.defineProperty(exports, "Bot", { enumerable: true, get: function () { return __importDefault(Bot_2).default; } });
var Tool_2 = require("./class/Tool");
Object.defineProperty(exports, "Tool", { enumerable: true, get: function () { return __importDefault(Tool_2).default; } });
Object.defineProperty(exports, "ToolEvents", { enumerable: true, get: function () { return Tool_2.ToolEvents; } });
var PacketBuilder_2 = require("./net/PacketBuilder");
Object.defineProperty(exports, "PacketBuilder", { enumerable: true, get: function () { return __importDefault(PacketBuilder_2).default; } });
Object.defineProperty(exports, "PacketEnums", { enumerable: true, get: function () { return PacketBuilder_2.PacketEnums; } });
var whitelisted_1 = require("./util/keys/whitelisted");
Object.defineProperty(exports, "KeyTypes", { enumerable: true, get: function () { return whitelisted_1.KeyTypes; } });
__exportStar(require("./class/AssetDownloader"), exports);
__exportStar(require("./class/Sanction"), exports);
const recursePattern = () => {
    return (Game_1.default.serverSettings.recursiveLoading && "/**/*.js") || "/*.js";
};
const disableCoreScript = (name) => {
    if (!Game_1.default.disabledCoreScripts.includes(name))
        Game_1.default.disabledCoreScripts.push(name);
};
function vmLoadScriptInDirectory(vm, scriptDirectory, scriptType) {
    const files = glob_1.default.sync(scriptDirectory + recursePattern(), { dot: true });
    for (const filePath of files) {
        const fileName = (0, path_1.basename)(filePath);
        // We do not want to load core scripts if the user disabled them
        if (Game_1.default.disabledCoreScripts.includes(fileName)) {
            console.log(`[*] Disabled Core Script: ${fileName}`);
            continue;
        }
        try {
            const scriptContents = fs.readFileSync(filePath, "UTF-8");
            vm.run(scriptContents, filePath);
            console.log(`[*] Loaded ${scriptType} Script: ${fileName}`);
        }
        catch (err) {
            console.log(`[*] Error loading ${scriptType} Script: ${fileName}`);
            console.error(err.stack);
        }
    }
}
function loadScripts() {
    const sandbox = {
        Game: Game_1.default,
        world: Game_1.default.world,
        Team: Team_1.default,
        Brick: Brick_1.default,
        Bot: Bot_1.default,
        Outfit: Outfit_1.default,
        util: { color: colorModule_1.default, filter: filterModule_1.default, serialize: serializerModule_1.default, chat: chatModule_1.default },
        Tool: Tool_1.default,
        PacketBuilder: PacketBuilder_1.default,
        Sanction: Sanction_1.default,
        AssetDownloader: AssetDownloader_1.default,
        sleep: (0, util_1.promisify)(setTimeout),
        Vector3: Vector3_1.default,
        debounce: (func, wait) => {
            let timeout;
            return function (...args) {
                if (timeout)
                    return;
                timeout = setTimeout(() => {
                    timeout = null;
                }, wait);
                func.apply(this, args);
            };
        },
        debouncePlayer: (func, wait) => {
            const playerDebounce = {};
            return function (...args) {
                const player = args[0];
                if (!Game_1.default.players.filter(p => p === player).length)
                    throw new Error('Object passed is not a valid player.');
                if (playerDebounce[player.userId])
                    return;
                playerDebounce[player.userId] = setTimeout(() => {
                    playerDebounce[player.userId] = null;
                }, wait);
                func.apply(this, args);
            };
        },
        getModule: (name) => {
            if (!Game_1.default.modules[name])
                throw new Error(`No module with the name ${name} found.`);
            return Game_1.default.modules[name];
        }
    };
    const vm = new vm2_1.NodeVM({
        require: {
            external: true,
            root: process.cwd(),
            context: "sandbox"
        },
        sandbox: sandbox
    });
    if (Game_1.default.disabledCoreScripts[0] !== "*")
        vmLoadScriptInDirectory(vm, CORE_DIRECTORY, "Core");
    else
        console.log("[*] All Core Scripts disabled");
    if (!Game_1.default.userScripts)
        return;
    vmLoadScriptInDirectory(vm, Game_1.default.userScripts, "User");
}
function initiateMap() {
    return __awaiter(this, void 0, void 0, function* () {
        if (Game_1.default.map && !Game_1.default.map.endsWith(".brk")) {
            console.log("Map selected is not a .brk file. Aborting.");
            return process.exit(0);
        }
        console.clear();
        try {
            const mapData = yield (0, scripts_1.loadBrk)((0, path_1.join)(Game_1.default.mapDirectory, Game_1.default.map));
            Object.assign(Game_1.default.world, mapData);
        }
        catch (err) {
            console.error("Failure parsing brk: ", err && err.stack);
            return process.exit(1);
        }
    });
}
/** Starts a node-hill server with the specified settings.*/
function startServer(settings) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        if (isNaN(settings.port)) {
            console.log("No port specified. Defaulted to 42480.");
            settings.port = 42480;
        }
        settings.postServer = (_a = settings.postServer) !== null && _a !== void 0 ? _a : true;
        settings.cli = (_b = settings.cli) !== null && _b !== void 0 ? _b : true;
        if (settings.scripts) {
            settings.scripts = (0, path_1.resolve)(process.cwd(), settings.scripts);
            Game_1.default.userScripts = settings.scripts;
        }
        Game_1.default.ip = settings.ip;
        Game_1.default.port = Number(settings.port);
        Game_1.default.hostKey = settings.hostKey;
        Game_1.default.gameId = Number(settings.gameId);
        Game_1.default.disabledCoreScripts = settings.disabledCoreScripts || [];
        Game_1.default.mapDirectory = settings.mapDirectory;
        // Load the modules into Game.modules so the user can call them with getModule()
        (_c = settings.modules) === null || _c === void 0 ? void 0 : _c.forEach((module) => {
            if (typeof module === 'string')
                Game_1.default.modules[module] = require(module);
            else if (typeof module === 'object')
                Object.assign(Game_1.default.modules, module);
        });
        if (settings.cli) {
            const serverline = require("serverline");
            const util = require("util");
            if (!process.stdout.isTTY) {
                console.warn("Context is not a terminal. Using pm2? Disable cli in server settings.");
                disableCoreScript("cli.js");
            }
            else {
                /*
                    We need to patch console functions that write to stdout in order to properly
                    handle line refreshing from serverline.
                */
                serverline._fixConsole = (con) => {
                    for (const s of ["log", "info", "error", "warn"]) {
                        con[s] = (...args) => {
                            console[s](util.format(...args).toString());
                        };
                    }
                };
                Game_1.default.modules["serverline"] = serverline;
            }
        }
        else {
            disableCoreScript("cli.js");
        }
        Game_1.default.recursiveLoading = Boolean(settings.recursiveLoading);
        Game_1.default.local = Boolean(settings.local);
        if (!Game_1.default.hostKey && !Game_1.default.local) {
            console.log("No host key specified.");
            return process.exit(0);
        }
        if (settings.mapDirectory && settings.map) {
            Game_1.default.mapDirectory = (0, path_1.resolve)(process.cwd(), settings.mapDirectory);
            Game_1.default.map = settings.map;
            yield initiateMap();
        }
        else {
            console.warn("WARNING: No map or mapDirectory set. Defaulting to empty baseplate.");
            Game_1.default.map = null;
        }
        if (!Game_1.default.gameId)
            console.warn("WARNING: No gameId set. Some functionality may be missing.");
        Game_1.default.serverSettings = settings;
        // Add support for bundle option.
        const args = process.argv.slice(2);
        for (const arg of args) {
            if (arg === '--bundle') {
                return (0, lib_1.bundleMapData)({
                    map: (Game_1.default.map && (0, path_1.join)(Game_1.default.mapDirectory, Game_1.default.map)),
                    scripts: {
                        directory: (0, path_1.relative)(process.cwd(), Game_1.default.userScripts),
                        files: ["**/*.js"]
                    }
                });
            }
        }
        // Do version check
        _getLatestnpmVersion()
            .then((package_version) => {
            if (package_version !== Game_1.default.version) {
                //console.warn(`WARNING: node-hill version is out of date. [Latest version: ${package_version}]. \nRun \`npm i node-hill@latest\` to resolve.`);
            }
        })
            .catch(() => {
            //console.warn('WARNING: Failure while checking for latest node-hill version.');
        });
        console.log(`<<<Port: ${Game_1.default.port} | Game: ${Game_1.default.gameId} | Map: ${Game_1.default.map}>>>`);
        require("./server");
        loadScripts();
        Game_1.default.emit("scriptsLoaded");
        return Game_1.default;
    });
}
exports.startServer = startServer;
function _getLatestnpmVersion() {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield phin({ url: NPM_LATEST_VERSION })).body.version;
    });
}