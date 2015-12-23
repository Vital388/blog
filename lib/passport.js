var passport = require('passport');
    LocalStrategy = require('passport-local').Strategy,
     model = require('./../model/db');
var Crypto=require('./random');
// Serialize sessions
passport.use(new LocalStrategy(
    {
        usernameField:'login',
        passwordField:'password'
    }
    ,
    function(login, password, cb) {
        model.users.findOne({login:login,password:Crypto.hashPassword(password)}, function(err, user) {
            if (err) { return cb(err); }
            if (!user) { return cb(null, false); }
            return cb(null, user);
        });
    }));


// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(function(user, cb) {
    cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
    model.users.findById(id, function (err, user) {
        if (err) { return cb(err); }
        cb(null, user);
    });
});
