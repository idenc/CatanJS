const express = require('express');
const app = express();
const http = require('http').createServer(app);
const mongoose = require('mongoose');
const io = require('./socket').init(http);
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const {ensureAuthenticated} = require('./config/auth');
const configureUserRegistration = require('./registration');
const configureChat = require('./chat');
const configureLobby = require('./lobby');

module.exports = app => {
    // Passport config
    require('./config/passport').localAuth(passport);
    require('./config/passport').googleAuth(passport);

    // DB Config
    const db = require('./config/keys').MongoURI;

    // Express body parser
    app.use(express.json());
    app.use(express.urlencoded({extended: true}));

    // Connect to Mongo
    mongoose.connect(db, {useNewUrlParser: true, useUnifiedTopology: true})
        .then(() => console.log('MongoDB connected'))
        .catch(err => console.log(err));

    // Express session
    const sessionMiddleware = session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true,
        store: new MongoStore({
            mongooseConnection: mongoose.connection
        })
    });
    app.use(sessionMiddleware);


    // Allow socket.io to access passport session
    io.use((socket, next) => {
        sessionMiddleware(socket.request, {}, next);
    })

    // Passport middleware
    app.use(passport.initialize());
    app.use(passport.session());


    io.on('connection', (socket) => {
        // Using socket io to handle registration,
        // Should probably change to just using a post request
        if (socket.request.session.passport && socket.request.session.passport.user) {
            console.log('user connected with id ' + socket.request.session.passport.user);
        }
        console.log('user connected');

        configureChat(socket);
        configureLobby(socket);
    });

    configureUserRegistration(app);

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

    configureUserRegistration(app);

    app.get('/user', ensureAuthenticated, (req, res) => {
        console.log([req.user, req.session])

        res.send({user: req.user})
    })


    app.get('/logout', (req, res) => {
        req.logout();

        console.log('logged out');

        return res.send();
    });

    app.get('/google',
        passport.authenticate('google', {scope: ['profile', 'email']}));

    // GET /auth/google/callback
    //   Use passport.authenticate() as route middleware to authenticate the
    //   request.
    app.get('/google/callback',
        passport.authenticate('google'), // complete the authenticate using the google strategy
        // eslint-disable-next-line no-unused-vars
        (err, req, res, next) => { // custom error handler to catch any errors, such as TokenError
            if (err.name === 'TokenError') {
                console.log(err);
            } else {
                // Handle other errors here
            }
        },
        (req, res) => { // On success, redirect back to '/'
            req.session.save(() => {
                if (req.authInfo.created) {
                    console.log("original Id: " + req.user._id);
                    // Need to make user set username
                    req.session.user = req.user;
                    return res.redirect('/#/register');
                } else {
                    // User has already registered, redirect
                    return res.redirect('/#/game');
                }
            });
        }
    );

    app.get('/register', (req, res) => {
        if (req.session.user) {
            return res.send(true);
        }
        return res.send(false);
    })

    http.listen(process.env.PORT || 9999, () => {
        console.log(`listening on *:${process.env.port || 9999}`);
    });
}
