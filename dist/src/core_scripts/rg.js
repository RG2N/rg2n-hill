const config = Game.serverSettings
let players = 0
const maxPlayers = config.maxPlayers
      

Game.on("playerJoin", player => {
    player.topPrint("RGs Framework - Beta Server", 4294967295)
    players = players + 1
    if (players > maxPlayers) {
        player.kick("Server slot limit reached! (" + players - 1 + "/" + maxPlayers + ")")
    }
})

Game.on("playerLeave", (player) => {
    players = players - 1
 })