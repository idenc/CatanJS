const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcrypt');
const {GoogleConsumerKey, GoogleConsumerSecret} = require('./keys')

// Load User Model
const User = require('../models/User');

module.exports = {
    localAuth: function (passport) {
        passport.use(
            new LocalStrategy({usernameField: 'email'}, (email, password, done) => {
                // Match User
                User.findOne({email: email})
                    .then(user => {
                        if (!user) {
                            return done(null, false, {message: 'That email is not registered'});
                        }

                        // Match password
                        bcrypt.compare(password, user.password, (err, isMatch) => {
                            if (err) throw err;

                            if (isMatch) {
                                return done(null, user);
                            } else {
                                return done(null, false, {message: 'Password incorrect'});
                            }
                        });
                    })
                    .catch(err => console.log(err));
            })
        );

        passport.serializeUser((user, done) => {
            done(null, user.id);
        });

        passport.deserializeUser((id, done) => {
            User.findById(id, (err, user) => {
                done(err, user);
            });
        });
    },
    googleAuth: function (passport) {
        // Use the GoogleStrategy within Passport.
        //   Strategies in passport require a `verify` function, which accept
        //   credentials (in this case, a token, tokenSecret, and Google profile), and
        //   invoke a callback with a user object.
        passport.use(new GoogleStrategy({
                clientID: GoogleConsumerKey,
                clientSecret: GoogleConsumerSecret,
                callbackURL: `http://localhost:${process.env.PORT || 3000}/google/callback`
            },
            function (token, tokenSecret, profile, done) {
                // Use the profile info (mainly profile id) to check if the user is registered in db
                User.findOne({email: profile.emails[0].value})
                    .then(user => {
                        if (!user) {
                            // Create user if not found
                            const newUser = new User({
                                name: profile.displayName,
                                email: profile.emails[0].value,
                            });
                            return done(null, newUser, { created: true });
                        }

                        // User found
                        return done(null, user, { created: false });
                    })
                    .catch(err => console.log(err));
            }
        ));

        passport.serializeUser((user, done) => {
            done(null, user.id);
        });

        passport.deserializeUser((id, done) => {
            User.findById(id, (err, user) => {
                done(err, user);
            });
        });
    }

}
