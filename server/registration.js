const User = require('./models/User')
const bcrypt = require('bcrypt');

module.exports = socket => {
    socket.on('user_register', (registration_info) => {
        console.log(registration_info);
        User.findOne({email: registration_info.email})
            .then(user => {
                // User exists
                if (user) {
                    socket.emit('registration_error', {msg: 'Email is already registered'});
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
}

