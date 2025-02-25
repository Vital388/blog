var express = require('express');
var router = express.Router();
var model = require('../../model/db');
var fs = require('fs');
var multiparty = require('multiparty');
var Crypto = require('../../lib/random');
var ensureAuthenticated = require('../../lib/auth');
var accessRight = require('../../lib/accessRight');

router.post('/categories/:catname', ensureAuthenticated, function (req, res, next) {
    var catname = req.params.catname;
    var cat = new model.categories({ name: catname });
    cat.save(function (err) {
        res.json({ accept: true });
    });
});

router.get('/categories/:catname', function (req, res, next) {
    var catname = req.params.catname;
    var pageNumber = req.query.page || 1;
    var resultsPerPage = req.query.resultsPerPage || 5;
    var skipFrom = (pageNumber * resultsPerPage) - resultsPerPage;

    model.posts.count({ category: catname }, function (err, c) {
        model.posts.find({ category: catname })
            .skip(skipFrom)
            .limit(resultsPerPage)
            .populate('image', 'path')
            .populate('author', 'displayName')
            .sort('-date')
            .exec(function (err, data) {
                res.json({ posts: data, pages_count: c });
            });
    });
});

router.get('/categories', function (req, res, next) {
    model.categories.find().exec(function (err, data) {
        res.json(data);
    });
});

router.get('/:postId', function (req, res, next) {
    var postId = req.params.postId;
    model.posts.findOne({ _id: postId })
        .populate('image', 'path')
        .populate('author', 'nickname')
        .exec(function (err, post) {
            if (post) {
                res.json(post);
            } else {
                res.sendStatus(404);
            }
        });
});

router.get('/author/:username', function (req, res, next) {
    var username = req.params.username;
    var pageNumber = req.query.page || 1;
    var resultsPerPage = req.query.resultsPerPage || 5;
    var skipFrom = (pageNumber * resultsPerPage) - resultsPerPage;
    model.posts.count({}, function (err, c) {
        model.posts.find({ author: username })
            .skip(skipFrom)
            .limit(resultsPerPage)
            .populate('image', 'path')
            .populate('author', 'displayName')
            .sort('-date')
            .exec(function (err, data) {
                res.json({ posts: data, pages_count: c });
            });
    });
});

router.get('/', function (req, res, next) {
    var pageNumber = req.query.page || 1;
    var resultsPerPage = req.query.resultsPerPage || 5;
    var skipFrom = (pageNumber * resultsPerPage) - resultsPerPage;
    model.posts.count({}, function (err, c) {
        model.posts.find()
            .skip(skipFrom)
            .limit(resultsPerPage)
            .populate('image', 'path')
            .populate('author', 'displayName')
            .sort('-date')
            .exec(function (err, data) {
                res.json({ posts: data, pages_count: c });
            });
    });
});

router.post('/', ensureAuthenticated, function (req, res, next) {
    var form = new multiparty.Form({ autoFields: false, autoFiles: false });
    var post = {};
    form.on('close', function () {
        var posts = new model.posts({
            author: req.user._id,
            title: post['title'],
            body: post['body'],
            excerption: post['excerption'],
            category: post['category']
        });
        posts.save(function (err) {
            if (err) console.log(err);
            res.json({ access: true, postID: posts._id });
        });
    });
    form.on('error', function (err) {
        console.log('Error parsing form: ' + err.stack);
    });
    form.on('field', function (name, value) {
        post[name] = value;
    });
    form.parse(req);
});

router.put('/:postId', ensureAuthenticated, accessRight.accessRightPost, function (req, res, next) {
    var postId = req.params.postId;
    var form = new multiparty.Form({ autoFields: false, autoFiles: false });
    var post = {};
    form.on('close', function () {
        model.posts.update({ _id: postId }, {
            title: post['title'],
            body: post['body'],
            excerption: post['excerption'],
            category: post['category']
        }, function (err, result) {
            if (err) return res.status(500).send(err);
            res.json({ access: true });
        });
    });
    form.on('error', function (err) {
        console.log('Error parsing form: ' + err.stack);
    });
    form.on('field', function (name, value) {
        post[name] = value;
    });
    form.parse(req);
});

router.delete('/:postId', ensureAuthenticated, accessRight.accessRightPost, function (req, res, next) {
    var postId = req.params.postId;
    model.posts.remove({ _id: postId }, function (err, result) {
        if (err) return res.status(500).send(err);
        res.json({ access: true });
    });
});

router.post('/image/:postId', ensureAuthenticated, accessRight.accessRightPost, function (req, res, next) {
    var postId = req.params.postId;
    res.json({ access: false }); // Disable image upload without S3
});

router.delete('/image/:postId', ensureAuthenticated, accessRight.accessRightImage, function (req, res, next) {
    var postId = req.params.postId;
    res.json({ access: false }); // Disable image delete without S3
});

module.exports = router;
