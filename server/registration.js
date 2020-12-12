const User = require('./models/User');
const bcrypt = require('bcrypt');

module.exports = app => {
    app.post('/register', (req, res) => {
        const registration_info = req.body;
        // Sign in through google
        if (req.session.user) {
            req.session.passport = {user: req.session.user._id}
            const newUser = new User(req.session.user);
            newUser.name = registration_info.name;
            newUser.save()
                .then(() => {
                    delete req.session.user;
                    res.redirect('/#/lobby');
                })
                .catch(err => console.log(err));
        } else {
            // Local registration
            User.findOne({email: registration_info.email})
                .then(user => {
                    // User exists
                    if (user) {
                        res.status(409).send({msg: 'Email is already registered'})
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
                                    .then(() => res.status(200).send())
                                    .catch(err => console.log(err));
                            });
                        });
                    }
                })
        }
    });
}

