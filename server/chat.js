const {v4: uuidv4} = require('uuid');
const io = require('./socket').getio();

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
    white: "#ffffff",
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

function pickUsername() {
    // Picks a random username from a set of adjectives and nouns
    // This username is then removed from being able to be chosen by removing that index pair from available choices
    const roll = Math.floor(Math.random() * usernameGen.indexes.length);
    const indices = usernameGen.indexes.splice(roll, 1)[0];

    return usernameGen.adjectives[indices[0]] + '_' + usernameGen.nouns[indices[1]];
}

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
            if (command.startsWith('/name')) {
                let name = command.split(" ");
                if (name.length !== 2) {
                    commandError(socket, 'Incorrect number of arguments for changing name. Command should be in the form /name <new username>')
                    return;
                }
                name = name[1];
                if (users.some(u => u.username === name)) {
                    commandError(socket, `User with username ${name} already exists`);
                    return;
                }
                for (let i = 0; i < users.length; i++) {
                    if (users[i].username === socket.username) {
                        io.emit('user changed', {old_name: socket.username, new_name: name});
                        socket.username = name;
                        users[i].username = name;
                        socket.emit('user info', {username: socket.username, color: socket.color});
                        return;
                    }
                }
            } else if (command.startsWith('/color')) {
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

    const messages = [];
    let users = [];

    socket.on('disconnect', () => {
        console.log(`${socket.username} left`)
        users = users.filter(u => u.username !== socket.username);
        io.emit('user left', socket.username);
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

    socket.on('user info', (user) => {
        // If user has connected before and someone has not taken their name
        if (user && !users.some(u => u.username === user.username)) {
            socket.username = user.username;
            socket.color = user.color;
        } else { // New user or username has been taken
            socket.username = pickUsername();
            socket.color = Colors.random();
            user = {username: socket.username, color: socket.color};
        }
        socket.emit('user info', user);
        users.push(user);
        console.log('a user connected with username ' + socket.username);
        socket.broadcast.emit('user joined', user);
        socket.emit('chat info', {current_users: users, messages: messages});
        console.log(users);
    });
}
