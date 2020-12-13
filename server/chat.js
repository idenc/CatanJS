"use strict";

const {v4: uuidv4} = require('uuid');
const io = require('./socket').getio();
const User = require('./models/User');


class chatRoom {
    socketRoom = '';
    messages = [];
    users = [];

    constructor(socketRoom) {
        this.socketRoom = socketRoom;
    }

    configureSocket = (socket) => {
        socket.on('disconnect', () => {
            console.log(`${socket.username} left`)
            const user = this.users.find(u => u.username === socket.username);
            if (user) {
                user.numSessions--;
                if (user.numSessions <= 0) {
                    this.users = this.users.filter(u => u.username !== socket.username);
                    io.emit('user left', socket.username);
                }
            }
        });
        socket.on('chat message', (msg) => {
            // Keep 200 most recent messages
            if (this.messages.length >= 200) {
                this.messages.shift();
            }
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
            this.messages.push(message);
            io.emit('chat message', message);
        });

        // socket.on('user info', (userInfo) => {
        //     if (!userInfo) {
        //         // Assign a new color if the client does not have one stored
        //         userInfo = {color: Colors.random()};
        //     }
        //     // User should be logged in
        //     if (socket.request.session.passport && socket.request.session.passport.user) {
        //         // Search for user by their id in the DB
        //         User.findById(socket.request.session.passport.user)
        //             .then((user) => {
        //                 // Let client know what their username/color is
        //                 socket.username = user.name;
        //                 userInfo.username = user.name;
        //                 socket.color = userInfo.color;
        //                 socket.emit('user info', userInfo);
        //                 // Check if the user is already present in the chat
        //                 // We want to keep track of the number of tabs user has open
        //                 if (!users.some(u => u.username === socket.username)) {
        //                     // If they are not, initialize their numSessions
        //                     userInfo.numSessions = 1;
        //                     users.push(userInfo);
        //                     socket.broadcast.emit('user joined', userInfo);
        //                 } else {
        //                     // Increment numSessions
        //                     console.log('found user')
        //                     const user = users.find(u => u.username === socket.username);
        //                     user.numSessions++;
        //                 }
        //                 console.log('a user connected with username ' + socket.username);
        //                 console.log(users);
        //             })
        //             .catch((e) => console.log(e))
        //     }
        //     socket.emit('chat info', {current_users: users, messages: messages});
        // });
    }
}

