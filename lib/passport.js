var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    model = require('../model/db'),
    Crypto = require('./random');

passport.use(new LocalStrategy(
    {
        usernameField: 'login',
        passwordField: 'password'
    },
    function(login, password, cb) {
        model.users.findOne({ login: login, password: Crypto.hashPassword(password) }, function(err, user) {
            if (err) { return cb(err); }
            if (!user) { return cb(null, false); }
            return cb(null, user);
        });
    }
));

passport.serializeUser(function(user, cb) {
    cb(null, user._id);
});

passport.deserializeUser(function(id, cb) {
    model.users.findById(id, function(err, user) {
        if (err) { return cb(err); }
        cb(null, user);
    });
});

module.exports = passport;
