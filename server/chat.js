"use strict";

const {v4: uuidv4} = require('uuid');
const io = require('./socket').getio();


class ChatRoom {
    socketRoom = '';
    messages = [];
    users = [];

    constructor(socketRoom) {
        this.socketRoom = socketRoom;
    }

    /**
     * Configures a socket for chat
     * The socket should be part of a game
     * so it should already have username
     * and colour set
     * @param socket socket to configure
     */
    configureSocket = (socket) => {
        socket.on('disconnect', () => {
            console.log(`${socket.player.name} left`)
            socket.numSessions--;
            if (socket.numSessions <= 0) {
                this.users = this.users.filter(u => u.username !== socket.player.name);
                io.to(this.socketRoom).emit('user_left', socket.player.name);
            }
        });

        socket.on('alert message', (msg) => {
            const message = {
                'user': "Server",
                'message': msg,
                'timestamp': Date.now(),
                'color': 'white',
                'id': uuidv4(),
            };
            messages.push(message);
            io.emit('chat message', message);
        });
    
        socket.on('chat_message', (msg) => {
            // Keep 200 most recent messages
            if (this.messages.length >= 200) {
                this.messages.shift();
            }
            // Replace emojis
            msg = msg.replace(/:\)/g, '😁');
            msg = msg.replace(/:\(/g, '🙁');
            msg = msg.replace(/:o/g, '😲');
            const message = {
                'user': socket.player.name,
                'message': msg,
                'timestamp': Date.now(),
                'color': socket.player.colour,
                'id': uuidv4(),
            };
            this.messages.push(message);
            io.to(this.socketRoom).emit('chat_message', message);
        });

        // Check if the user is already present in the chat
        // We want to keep track of the number of tabs user has open
        if (!this.users.some(u => u.username === socket.player.name)) {
            // If they are not, initialize their numSessions
            socket.numSessions = 1;
            const userInfo = {
                username: socket.player.name,
                colour: socket.player.colour,
                victoryPoints: socket.player.victoryPoints,
                numDevCards: socket.player.devCards.length
            };
            this.users.push(userInfo);
            // Tell everyone else another user joined
            socket.to(this.socketRoom).emit('user_joined', userInfo);
            // Give the user their info
            socket.emit('user_info', userInfo)
        } else {
            // Increment numSessions
            console.log('found user')
            socket.numSessions++;
    socket.on('got kicked', (user) => {
        io.emit('got kicked', user);
        users = users.filter(u => u.username !== user.username);
        io.emit('user left', user.username);
        if (users.length >= 1 && users[0].isHost === false) {
            users[0].isHost = true;
        }
    });

    socket.on('mute player', (user) => {
        io.emit('mute player', user);
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
                    userInfo.isHost = false;
                    socket.color = userInfo.color;
                    // socket.emit('user info', userInfo);
                    if (users.length == 0) {
                        userInfo.isHost = true;
                    }
                    socket.isHost = userInfo.isHost;
                    if (!users.some(u => u.username === user.name)) {
                        users.push(userInfo);
                        socket.broadcast.emit('user joined', userInfo);
                    }
                    console.log("users below");
                    console.log(users);
                    socket.emit('user list', users );
                    socket.emit('user info', userInfo);                              
                    console.log('a user connected with username ' + socket.username);
                    // socket.broadcast.emit('user joined', userInfo);
                    socket.emit('chat info', {current_users: users, messages: messages});
                })
                .catch((e) => console.log(e))
        }
        console.log('a user connected with username ' + socket.player.name);
        console.log(this.users);
        socket.emit('chat_info', {
            current_users: this.users,
            messages: this.messages
        });
    }
}

module.exports = ChatRoom
