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
            console.log(`${socket.username} left`)
            socket.numSessions--;
            if (socket.numSessions <= 0) {
                this.users = this.users.filter(u => u.username !== socket.username);
                io.to(this.socketRoom).emit('user_left', socket.username);
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
                'user': socket.username,
                'message': msg,
                'timestamp': Date.now(),
                'color': socket.colour,
                'id': uuidv4(),
            };
            this.messages.push(message);
            io.to(this.socketRoom).emit('chat_message', message);
        });

        // Check if the user is already present in the chat
        // We want to keep track of the number of tabs user has open
        if (!this.users.some(u => u.username === socket.username)) {
            // If they are not, initialize their numSessions
            socket.numSessions = 1;
            const userInfo = {
                username: socket.username,
                colour: socket.colour
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
        console.log('a user connected with username ' + socket.username);
        console.log(this.users);
        socket.emit('chat_info', {
            current_users: this.users,
            messages: this.messages
        });
    }
}

module.exports = ChatRoom
