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

        socket.on('leave_game', () => {
            console.log(`${socket.player.name} left`)
            socket.numSessions--;
            if (socket.numSessions <= 0) {
                this.users = this.users.filter(u => u.username !== socket.player.name);
                io.to(this.socketRoom).emit('user_left', socket.player.name);
            }
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

        socket.on('alert message', (msg) => {
            if (this.messages.length >= 200) {
                this.messages.shift();
            }
            const message = {
                'user': 'Server',
                'message': msg,
                'timestamp': Date.now(),
                'color': socket.player.colour,
                'id': uuidv4(),
            };
            this.messages.push(message);
            io.to(this.socketRoom).emit('chat_message', message);
        });

        socket.on('got kicked', (user) => {
            io.to(this.socketRoom).emit('got kicked', user);
            this.users = this.users.filter(u => u.username !== user.username);
            io.to(this.socketRoom).emit('user_left', user.username);
            if (this.users.length >= 1 && this.users[0].isHost === false) {
                this.users[0].isHost = true;
            }
        });

        socket.on('mute player', (user) => {
            io.to(this.socketRoom).emit('mute player', user);
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
                numDevCards: socket.player.devCards.length,
                brick: socket.player.brick,
                grain: socket.player.grain,
                lumber: socket.player.lumber,
                ore: socket.player.ore,
                wool: socket.player.wool
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
        }

        console.log('a user connected with username ' + socket.player.name);
        //console.log(this.users);

        socket.emit('chat_info', {
            current_users: this.users,
            messages: this.messages
        });
    }
}

module.exports = ChatRoom
