"use strict";

const {v4: uuidv4} = require('uuid');
const io = require('./socket').getio();
const User = require('./models/User');

const usernameGen = {
    adjectives: ['small', 'ugly', 'big', 'beautiful', 'angry', 'sad', 'happy'],
    nouns: ['bear', 'panda', 'fish', 'frog', 'snake', 'kangaroo'],
    indexes: []
};


for (let i = 0; i < usernameGen.adjectives.length; i++) {
    for (let j = 0; j < usernameGen.nouns.length; j++) {
        usernameGen.indexes.push([i, j]);
    }
}

// Color code from https://stackoverflow.com/questions/10014271/generate-random-color-distinguishable-to-humans
const Colors = {};
Colors.names = {
    aqua: "#00ffff",
    azure: "#f0ffff",
    beige: "#f5f5dc",
    black: "#000000",
    brown: "#a52a2a",
    cyan: "#00ffff",
    darkcyan: "#008b8b",
    darkgrey: "#a9a9a9",
    darkgreen: "#006400",
    darkkhaki: "#bdb76b",
    darkmagenta: "#8b008b",
    darkolivegreen: "#556b2f",
    darkorange: "#ff8c00",
    darkorchid: "#9932cc",
    darkred: "#8b0000",
    darksalmon: "#e9967a",
    darkviolet: "#9400d3",
    fuchsia: "#ff00ff",
    gold: "#ffd700",
    green: "#008000",
    indigo: "#4b0082",
    khaki: "#f0e68c",
    lightblue: "#add8e6",
    lightcyan: "#e0ffff",
    lightgreen: "#90ee90",
    lightgrey: "#d3d3d3",
    lightpink: "#ffb6c1",
    lightyellow: "#ffffe0",
    lime: "#00ff00",
    magenta: "#ff00ff",
    maroon: "#800000",
    olive: "#808000",
    orange: "#ffa500",
    pink: "#ffc0cb",
    purple: "#800080",
    violet: "#800080",
    red: "#ff0000",
    silver: "#c0c0c0",
    yellow: "#ffff00"
};

Colors.random = function () {
    let result;
    let count = 0;
    for (const prop in this.names)
        if (Math.random() < 1 / ++count)
            result = prop;
    // Avoid colour repetition
    delete this.result;
    return result;
};

const messages = [];
let users = [];

/**
 * Checks whether a color string is a valid hex color
 * source: https://stackoverflow.com/questions/8027423/how-to-check-if-a-string-is-a-valid-hex-color-representation
 * Answer by fflorent
 * @param hex
 * @returns {boolean}
 */
function isHexColor(hex) {
    return typeof hex === 'string'
        && hex.length === 6
        && !isNaN(Number('0x' + hex))
}

module.exports = socket => {
    function commandError(socket, error) {
        socket.emit('command error', {message: error, id: uuidv4()})
    }

    function handleCommand(socket, command) {
        try {
            if (command.startsWith('/color')) {
                let color = command.split(" ");
                if (color.length !== 2) {
                    commandError(socket, 'Incorrect number of arguments for changing color. Command should be in the form /color RRGGBB')
                    return;
                }
                color = color[1];
                if (!isHexColor(color)) {
                    commandError(socket, `Invalid color: ${color}`);
                }
                color = "#" + color;
                for (let i = 0; i < users.length; i++) {
                    if (users[i].username === socket.username) {
                        socket.color = color;
                        users[i].color = color;
                        io.emit('color change', {username: socket.username, new_color: color})
                        return;
                    }
                }
            } else {
                commandError(socket, `No such command exists: ${command}`);
            }
        } catch (err) {
            console.error(err);
            commandError(socket, `Failed to apply command: ${command}`);
        }

    }

    socket.on('disconnect', () => {
        console.log(`${socket.username} left`)
        const user = users.find(u => u.username === socket.username);
        if (user) {
            user.numSessions--;
            if (user.numSessions <= 0) {
                users = users.filter(u => u.username !== socket.username);
                io.emit('user left', socket.username);
            }
        }
    });
    socket.on('chat message', (msg) => {
        // Keep 200 most recent messages
        if (messages.length >= 200) {
            messages.shift();
        }
        // Handle commands
        if (msg.startsWith('/')) {
            handleCommand(socket, msg)
        } else {
            // Replace emojis
            msg = msg.replace(/:\)/g, '😁');
            msg = msg.replace(/:\(/g, '🙁');
            msg = msg.replace(/:o/g, '😲');
            const message = {
                'user': socket.username,
                'message': msg,
                'timestamp': Date.now(),
                'color': socket.color,
                'id': uuidv4(),
            };
            messages.push(message);
            io.emit('chat message', message);
        }
    });

    socket.on('user info', (userInfo) => {
        if (!userInfo) {
            // Assign a new color if the client does not have one stored
            userInfo = {color: Colors.random()};
        }
        // User should be logged in
        if (socket.request.session.passport && socket.request.session.passport.user) {
            // Search for user by their id in the DB
            User.findById(socket.request.session.passport.user)
                .then((user) => {
                    // Let client know what their username/color is
                    socket.username = user.name;
                    userInfo.username = user.name;
                    socket.color = userInfo.color;
                    socket.emit('user info', userInfo);
                    // Check if the user is already present in the chat
                    // We want to keep track of the number of tabs user has open
                    if (!users.some(u => u.username === socket.username)) {
                        // If they are not, initialize their numSessions
                        userInfo.numSessions = 1;
                        users.push(userInfo);
                        socket.broadcast.emit('user joined', userInfo);
                    } else {
                        // Increment numSessions
                        console.log('found user')
                        const user = users.find(u => u.username === socket.username);
                        user.numSessions++;
                    }
                    console.log('a user connected with username ' + socket.username);
                    console.log(users);
                })
                .catch((e) => console.log(e))
        }
        socket.emit('chat info', {current_users: users, messages: messages});
    });
}
