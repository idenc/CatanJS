// All active games
let games = {};

module.exports = socket => {
    // Request to create game
    socket.on("create_game", (gameRequest) => {
        const key = gameRequest.name.toLowerCase();

        let response;
        if (key in games) {
            response = "failed";
        } else {
            gameRequest["players"] = [socket];
            games[key] = gameRequest;
            console.log(games);
            response = "success"; // replace with room code?
        }

        socket.emit("create_game", response);
    });

    // Request for server list to display
    // Only send needed data
    socket.on("get_games", (query) => {
        let result = {};

        const queryName = query.toLowerCase();
        for (let key in games) {
            const searchName = key.toLowerCase();
            if (searchName.startsWith(queryName)) {
                result[key] = {
                    name : games[key]["name"],
                    type : games[key]["type"],
                    numPlayers : games[key]["numPlayers"],
                    playerCap : games[key]["playerCap"]
                };
            }
        }

        socket.emit("get_games", result);
    });
}