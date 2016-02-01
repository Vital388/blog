var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
     model = require('./../model/db'),
    os=require('os'),
    faceconf=require('./facewbook_config.json');
 Crypto=require('./random');
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
var FacebookStrategy = require('passport-facebook').Strategy;

passport.use(new FacebookStrategy({
        clientID: faceconf.clientID,
        clientSecret: faceconf.clientSecret,
        callbackURL: faceconf.callbackURL

    },
    function(accessToken, refreshToken, profile, done) {
        model.facebookUsers.findOneAndUpdate({
        id: profile.id
        },{
                id:profile.id,
                displayName:profile.displayName
        },
            {upsert:true},
            function(err, user) {
            if (err) { return done(err); }
            done(null, user);
        });
    }
));
// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(function(user, cb) {
    var userType = user.nickname?0:1 ;
    cb(null, {id:user._id,userType:userType});
});

passport.deserializeUser(function(user, cb) {
    var collection =user.userType? model.facebookUsers :model.users;
    collection.findById(user.id, function (err, user) {
        if (err) { return cb(err); }
        cb(null, user);
    });
});
