var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const PacketBuilder = require("../../net/PacketBuilder").default;
function kick(socket, message = "No reason given.") {
    return __awaiter(this, void 0, void 0, function* () {
        yield new PacketBuilder("PlayerModification")
            .write("string", "kick")
            .write("string", "[You were kicked]\n\nReason: " + message)
            .send(socket);
        socket.destroy();
    });
}
module.exports = kick;
