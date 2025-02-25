var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var pass = require('./lib/passport.js');
var users = require('./routes/api/users');
var posts = require('./routes/api/posts');
var app = express();

// Middleware setup
app.use(favicon(__dirname + '/public/favicon.ico'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: 'VITAL',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Serve static files FIRST
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'bower_components')));

// API routes
app.use('/api/users', users);
app.use('/api/posts', posts);

// Catch-all route for client-side routing (Angular)
app.use('/*', function(req, res, next) {
    console.log('Catch-all route hit for:', req.originalUrl);
    res.sendFile("main.html", { root: __dirname + "/public" });
});

// Error handlers
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', { message: err.message, error: err });
    });
}

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', { message: err.message, error: {} });
});

module.exports = app;
