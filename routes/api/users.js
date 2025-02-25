var express = require('express');
var router = express.Router();
var model = require('../../model/db');
var multiparty = require('multiparty');
var Crypto = require('../../lib/random');
var passport = require('passport');
var os = require('os');

router.post('/signOn', function (req, res, next) {
    var form = new multiparty.Form({
        autoFields: false,
        autoFiles: false,
        uploadDir: os.tmpdir()
    });
    var user = {}; // Changed from array to object

    form.on('close', function () {
        // Check for required fields
        if (!user['login'] || !user['password'] || !user['nickname']) {
            return res.status(400).send({ error: 'Missing required fields: login, password, or nickname' });
        }

        // Hash the password
        var heshPass = Crypto.hashPassword(user['password']);

        // Create a new user document
        var newUser = new model.users({
            login: user['login'],
            password: heshPass,
            nickname: user['nickname'],
            email: user['email'] || '',
            date_of_birth: user['date_of_birth'] || null,
            sex: user['sex'] || '',
            avatar: user['avatar'] || ''
        });

        // Save the user using Promises
        newUser.save()
            .then((data) => {
                res.send({ id: data._id });
            })
            .catch((err) => {
                if (err.code === 11000) {
                    res.status(400).send({ error: 'Login or nickname already exists' });
                } else {
                    res.status(500).send({ error: 'An error occurred during registration' });
                }
            });
    });

    form.on('error', function (err) {
        console.log('Error parsing form: ' + err.stack);
        res.status(500).send({ error: 'Failed to parse form data' });
    });

    form.on('field', function (name, value) {
        user[name] = value;
    });

    form.on('part', function (part) {
        part.resume(); // Placeholder for file handling if needed
    });

    form.parse(req);
});

router.post('/signIn',
    passport.authenticate('local'),
    function (req, res) {
        // Set user cookie and send success response
        res.cookie('user', JSON.stringify({ nickname: req.user.nickname, _id: req.user._id }), { httpOnly: false });
        res.status(200).json({ status: 'success', user: { nickname: req.user.nickname, _id: req.user._id } });
    }
);

router.get('/logout',
    function (req, res) {
        if (req.user) {
            req.logout();
            res.json({ status: 'ok' });
        } else {
            res.json({ status: 'Not logged in' });
        }
    }
);

module.exports = router;
