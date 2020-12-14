const {Game} = require("./gameLogic/game");
const Player = require("./gameLogic/player");
const User = require('./models/User');
//const io = require('./socket').getio();


// All active games
let lobbies = {};
let games = {};
let timeout;


module.exports = socket => {
    if (socket.request.session.passport && socket.request.session.passport.user) {
        User.findById(socket.request.session.passport.user, (err, user) => {
            if (user) {
                // Reconnect player to game
                for (let key in games) {
                    let game = games[key];
                    for (const player of game.players) {
                        if (player.name === user.name) {
                            clearTimeout(timeout);
                            game.configureSocketInteractions(socket);
                            socket.on('request_game', () => {
                                socket.emit('is_in_game');
                            });
                        }
                    }
                }
            }
        });
    }

    // Request to create game
    socket.on("lobby_create_game", (gameRequest) => {
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
            //console.log(games);
            response = "success"; // replace with room code?
        }

        socket.emit("create_game", response);
    });

    // Request for server list to display
    // Only send needed data
    socket.on("lobby_get_games", (query) => {
        let result = {};

        const queryName = query.toLowerCase();
        for (let key in games) {
            const searchName = key.toLowerCase();
            if (searchName.startsWith(queryName)) {
                result[key] = {
                    name: lobbies[key]["name"],
                    type: lobbies[key]["type"],
                    numPlayers: lobbies[key]["numPlayers"],
                    playerCap: lobbies[key]["playerCap"]
                };
            }
        }

        socket.emit("get_games", result);
    });

    socket.on("lobby_join_game", (name) => {
        const key = name.toLowerCase();

        if (lobbies[key]["numPlayers"] < lobbies[key]["playerCap"]) {
            if (lobbies[key]["type"] == "public") {
                lobbies[key]["numPlayers"] += 1;
                lobbies[key]["players"].push(socket);
                games[key].configureSocketInteractions(socket);
                socket.emit("create_game", "success"); // Temporary hack
            } else {
                socket.emit("enter_password", name);
            }
        }
    });

    socket.on("lobby_join_game_passworded", (bundle) => {
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
                // Wait one minute before removing the player
                // to give them a chance to reconnect
                timeout = setTimeout(() => {
                    lobby["players"].splice(ind, 1); // remove socket from playerlist
                    lobby["numPlayers"] -= 1;

                    if (lobby["numPlayers"] == 0) {
                        delete lobbies[key];
                        delete games[key];
                    }
                }, 60000);
            }
        }
    });

    socket.on('lobby_leave_game', () => {
        for (let key in lobbies) {
            let lobby = lobbies[key];

            const ind = lobby["players"].indexOf(socket);
            if (ind != -1) {
                const game = games[key];
                game.players.splice(ind, 1);
                socket.leave(game.socketRoom);

                lobby["players"].splice(ind, 1); // remove socket from playerlist
                lobby["numPlayers"] -= 1;

                // remove unused event listeners
                const events = socket.eventNames();
                for (const eventName of events) {
                    if (!eventName.startsWith("lobby_")) {
                        socket.removeAllListeners([eventName]);
                    }

                    //console.log(eventName + " : " + socket.listenerCount(eventName));
                }

                // Delete room if there are no more players
                if (lobby["numPlayers"] == 0) {
                    delete lobbies[key];
                    delete games[key];
                } else {
                    const name = socket.player.name;

                    for (let i = 0; i < game.roads.length; i++) {
                        if (game.roads[i].player == name) {
                            game.roads.splice(i, 1);
                            i -= 1;
                        }
                    }

                    socket.to(game.socketRoom).emit('update_roads', {
                        roads: game.roads
                    });

                    game.settlements.forEach(function (value, key, map) {
                        if (value.player == name) {
                            value.player = "";
                            value.state = "empty";
                        }
                    });

                    const jsonSettlements = JSON.stringify(Array.from(game.settlements.entries()));

                    // Send the updated settlement to all players
                    // Send the updated settlements and player info to player who built
                    socket.to(game.socketRoom).emit('update_settlements', {
                        settlements: jsonSettlements
                    });
                }

                //console.log(games);

                socket.emit('ready_to_leave');
            }
        }

    });
}
