var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/*eslint no-undef: "off"*/
const serverline = getModule('serverline');
serverline._fixConsole(console);
serverline.init();
serverline.setPrompt('RGsConsole> ');
function lineHandler(line) {
    return __awaiter(this, void 0, void 0, function* () {
        if (line === "clear")
            return console.clear();
        else if (line === "quit") {
            console.info("Goodbye!");
            Game.players.forEach(player => {
                player.kick('Server Shutdown'); 
            });
            setTimeout(function(){ 
                Game.shutdown(0);
            }, 1000);
        }
        else if (line === "restart") {
            console.info("Restarting.");
            Game.clearMap();
            Game.loadBrk(Game.serverSettings.map);
        }
        else if (line.startsWith("args ")) {
            argsP = line.substring(5);
            const args = argsP.split(" ");
            args.forEach(arg => {
                console.info(arg)
            });
        }
        else if (line.startsWith("kickall ")) {
            arg = line.substring(8);
            Game.players.forEach(player => {
                player.kick(arg); 
            });
        }
        try {
            const data = yield eval(`(async() => { return "${line}" })()`);
            if (typeof data !== "undefined")
                console.log(data);
        }
        catch (err) {
            console.error(err);
        }
    });
}
serverline.on('line', lineHandler);
