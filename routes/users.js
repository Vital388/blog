var express = require('express');
var router = express.Router();
var model = require('../model/db');
var multiparty = require('multiparty');
/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});
router.get('/registration', function (req, res, next) {
    res.send('respond with a resource');
});
router.get('/login', function (req, res, next) {
    res.send('respond with a resource');
});
router.post('/registration', function (req, res, next) {
    var form = new multiparty.Form({autoFields: false, autoFiles: false});
    var user = [];
    form.on('close', function () {

        user = new model.users({
            login: user['login'],
            password: user['password'],
            nickname: user['nickname'],
            email: user['email'],
            date_of_birth: user['date_of_birth'],
            sex: user['sex'],
            avatar: user['avatar']
        });
        user.save(function (err,data) {
            res.send({id: user['_id']})
        })
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
router.post('/login', function (req, res, next) {
    var form = new multiparty.Form({autoFields: false, autoFiles: false});
    var user = [];
    form.on('close', function () {
        model.users.findOne({
            login: user['login'],
            password: user['password']
        }).exec(function (err, data) {
            if (data) {

                res.send( data);
            } else {

                res.sendStatus(404);
            }
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
