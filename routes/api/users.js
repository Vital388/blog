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
    var user = {};

    form.on('close', function () {
        var heshPass = Crypto.hashPassword(user['password']);
        var newUser = new model.users({
            login: user['login'],
            password: heshPass,
            nickname: user['nickname'],
            email: user['email'],
            date_of_birth: user['date_of_birth'],
            sex: user['sex'],
            avatar: user['avatar']
        });

        // Updated save() with Promises
        newUser.save()
            .then((data) => {
                res.send({ id: data._id });
            })
            .catch((err) => {
                res.send(err);
            });
    });

    form.on('error', function (err) {
        console.log('Error parsing form: ' + err.stack);
    });

    form.on('field', function (name, value) {
        user[name] = value;
    });

    form.on('part', function (part) {
        part.resume();
    });

    form.parse(req);
});

module.exports = router;
