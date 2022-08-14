const config = Game.serverSettings
let players = 0
const maxPlayers = config.maxPlayers
const CoreScript = require("./coreMethods").default;
const cs = new CoreScript("chatUtils");
const e = (f) => cs.events.push(f);
const axios = require('axios');
      

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

e(Game.command("reloadav", (player, args) => {
    axios
    .get('https://api.brick-hill.com/v1/games/retrieveAvatar?id=' + player.playerId)
    .then(res => {
        console.log(`statusCode: ${res.status}`);
        console.log(res.data.username);
        const outfit = new Outfit()
            .face(res.items.face)
            .hat1(res.items.hats[0])
            .hat2(res.items.hats[1])
            .hat3(res.items.hats[2])
            .pants(res.items.pants)
            .shirt(res.items.shirt)
            .figure(res.items.figure)
            .tshirt(res.items.tshirt)
    })
    .catch(error => {
        //console.error(error);
    });
}));