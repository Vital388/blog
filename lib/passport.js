var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    model = require('../model/db'),
    Crypto = require('./random');

// LocalStrategy for login
passport.use(new LocalStrategy(
    {
        usernameField: 'login',
        passwordField: 'password'
    },
    function(login, password, cb) {
        // Use Promises instead of callbacks
        model.users.findOne({ login: login, password: Crypto.hashPassword(password) })
            .then(user => {
                if (!user) {
                    return cb(null, false); // User not found
                }
                return cb(null, user); // User found
            })
            .catch(err => {
                return cb(err); // Pass any error to Passport
            });
    }
));

// Serialize user for the session
passport.serializeUser(function(user, cb) {
    cb(null, user._id);
});

// Deserialize user from the session
passport.deserializeUser(function(id, cb) {
    // Use Promises instead of callbacks
    model.users.findById(id)
        .then(user => {
            if (!user) {
                return cb(null, false); // User not found
            }
            return cb(null, user); // User found
        })
        .catch(err => {
            return cb(err); // Pass any error to Passport
        });
});

module.exports = passport;
