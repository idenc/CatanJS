const {Game} = require("./gameLogic/game");
const Player = require("./gameLogic/player");

// All active games
let lobbies = {};
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
            //socket.join(key);
            lobbies[key] = gameRequest;
            games[key] = new Game(key);
            games[key].configureSocketInteractions(socket);
            games[key].players.push(new Player());
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
                    name : lobbies[key]["name"],
                    type : lobbies[key]["type"],
                    numPlayers : lobbies[key]["numPlayers"],
                    playerCap : lobbies[key]["playerCap"]
                };
            }
        }

        socket.emit("get_games", result);
    });

    socket.on("join_game", (name) => {
        const key = name.toLowerCase();

        if (lobbies[key]["numPlayers"] < lobbies[key]["playerCap"]) {
            if (lobbies[key]["type"] == "public") {
                lobbies[key]["numPlayers"] += 1;
                lobbies[key]["players"].push(socket);
                games[key].configureSocketInteractions(socket);
                games[key].players.push(new Player());
                socket.emit("create_game", "success"); // Temporary hack
            } else {
                socket.emit("enter_password", name);
            }
        }
    });

    socket.on("join_game_passworded", (bundle) => {
        const name = bundle.name;
        const password = bundle.password;

        const key = name.toLowerCase();

        if (password == lobbies[key]["password"]) {
            if (lobbies[key]["numPlayers"] < lobbies[key]["playerCap"]) {
                lobbies[key]["numPlayers"] += 1;
                lobbies[key]["players"].push(socket);
                games[key].configureSocketInteractions(socket);
                games[key].players.push(new Player());
                socket.emit("create_game", "success"); // Temporary hack
            }
        } else {
            socket.emit("lobby_error", "Wrong Password");
        }
    });


    socket.on("disconnect", () => {
        for (let key in lobbies) {
            let lobby = lobbies[key];

            const ind = lobby["players"].indexOf(socket);
            if (ind != -1) {
                lobby["players"].splice(ind, 1); // remove socket from playerlist
                lobby["numPlayers"] -= 1;

                if (lobby["numPlayers"] == 0) {
                    delete lobbies[key];
                    delete games[key];
                }

                console.log(games);
            }
        }
    });
}