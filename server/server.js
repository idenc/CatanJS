const bcrypt = require('bcrypt');
const path = require('path');
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const mongoose = require('mongoose');
const io = require('socket.io')(http);
const User = require('./models/User');

// DB Config
const db = require('./config/keys').MongoURI;

// Connect to Mongo
mongoose.connect(db, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Bodyparser
app.use(express.urlencoded({extended: false}));

app.use(express.static(path.join(__dirname + '/../dist')));

const PORT = process.env.PORT || 3000;

io.on('connection', (socket) => {
    console.log('user connected');
    socket.on('user_register', (registration_info) => {
        console.log(registration_info);
        User.findOne({email: registration_info.email})
            .then(user => {
                // User exists
                if (user) {
                    socket.emit('registration error', {msg: 'Email is already registered'});
                } else {
                    // Register new user
                    const newUser = new User({
                        name: registration_info.name,
                        email: registration_info.email,
                        password: registration_info.password
                    });
                    // Hash password
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) throw err;
                            newUser.password = hash;
                            console.log(newUser);
                            // Save user
                            newUser.save()
                                .then(() => socket.emit('user_register'))
                                .catch(err => console.log(err));
                        });
                    });
                }
            })
    });
});

http.listen(PORT, () => {
    console.log('listening on *:3000');
});
