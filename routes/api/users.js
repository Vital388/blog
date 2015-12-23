var express = require('express');
var router = express.Router();
var model = require('../../model/db');
var multiparty = require('multiparty');
var Crypto=require('../../lib/random');
var passport = require('passport')




router.post('/signOn', function (req, res, next) {
    var form = new multiparty.Form({autoFields: false, autoFiles: false});
    var user = [];
    form.on('close', function () {
        var heshPass=Crypto.hashPassword(user['password']);
        user = new model.users({
            login: user['login'],
            password: heshPass,
            nickname: user['nickname'],
            email: user['email'],
            date_of_birth: user['date_of_birth'],
            sex: user['sex'],
            avatar: user['avatar']
        });
        user.save(function (err,data) {
            if(!err){
            res.send({id: data['_id']})
            }else{
                res.send(err);
            }
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
router.post('/signIn',
    passport.authenticate('local'),
    function(req, res) {
        res.cookie('user', JSON.stringify({nickname:req.user.nickname}))
        res.send(200);
    });

/*
    var form = new multiparty.Form({autoFields: false, autoFiles: false});
    var user = [];
    form.on('close', function () {
        var heshPass=Crypto.hashPassword(user['password']);
        model.users.findOne({
            login: user['login'],
            password: heshPass
        }).exec(function (err, data) {

            if (data) {
                res.send( data);
            } else {

                res.json(err);
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

*/
router.get('/logout',
    function(req, res) {
        if(req.user) {
            req.logout();
            res.json({status:'ok'})
        } else {
            res.json({status: "Not logged in"});
        }
    });


module.exports = router;
