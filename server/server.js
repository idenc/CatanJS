const bcrypt = require('bcrypt');
const path = require('path');
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const mongoose = require('mongoose');
const io = require('socket.io')(http);
const User = require('./models/User');
const passport = require('passport');
const session = require('express-session');
const {ensureAuthenticated} = require('./config/auth');

// Passport config
require('./config/passport')(passport);

// DB Config
const db = require('./config/keys').MongoURI;

// Express body parser
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Express session
app.use(
    session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true
    })
);

// Connect to Mongo
mongoose.connect(db, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Serve production
app.use(express.static(path.join(__dirname + '/../dist')));

const PORT = process.env.PORT || 3000;

io.on('connection', (socket) => {
    // Using socket io to handle registration,
    // Should probably change to just using a post request
    console.log('user connected');
    socket.on('user_register', (registration_info) => {
        console.log(registration_info);
        socket.emit('user_register');
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

// Post request will handle login with passport js
app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.log('error: ' + err);
            return next(err);
        }

        if (!user) {
            console.log('no user');
            return res.status(401).send({info: info});
        }

        req.login(user, () => {
            res.send('Logged in');
        });
    })(req, res, next);
});

app.get('/user', ensureAuthenticated, (req, res) => {
    console.log([req.user, req.session])

    res.send({user: req.user})
})


app.get('/logout', (req, res) => {
    req.logout();

    console.log('logged out');

    return res.send();
});


http.listen(PORT, () => {
    console.log('listening on *:3000');

});
