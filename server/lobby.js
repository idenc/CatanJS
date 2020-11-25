// All active games
let games = {};

module.exports = socket => {
    socket.on("create_game", (gameRequest) => {
        const key = gameRequest.name;
        gameRequest["players"] = [socket];
        games[key] = gameRequest;
        console.log(games);
    });

    socket.on("get_games", (query) => {
        let result = {};

        const queryName = query.toLowerCase();
        for (let gameName in games) {
            const searchName = gameName.toLowerCase();
            if (searchName.startsWith(queryName)) {
                result[gameName] = {
                    name : gameName,
                    type : games[gameName]["type"],
                    numPlayers : games[gameName]["numPlayers"],
                    playerCap : games[gameName]["playerCap"]
                };
            }
        }
        socket.emit("get_games", result);
    });
}