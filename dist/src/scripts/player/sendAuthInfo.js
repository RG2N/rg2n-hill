const Game = require("../../class/Game").default;
const PacketBuilder = require("../../net/PacketBuilder").default;
function sendAuthInfo(player) {
    let brickCount = 0;
    if (Game.sendBricks)
        brickCount = Game.world.bricks.length;
    const auth = new PacketBuilder("Authentication")
        .write("uint32", player.netId)
        .write("uint32", brickCount)
        .write("uint32", player.userId)
        .write("string", player.username)
        .write("bool", player.admin)
        .write("uint8", player.membershipType)
        .write("uint32", Game.gameId);
    if (Game.name)
        auth.write("string", Game.name);
    return auth.send(player.socket);
}
module.exports = sendAuthInfo;
