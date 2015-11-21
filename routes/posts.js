var express = require('express');
var router = express.Router();
var model = require('../model/db');
var Busboy = require('busboy');
var fs = require('fs');
/* GET users listing. */

router.get('/', function (req, res, next) {
    var pages_count;
    var pageNumber = req.query.page || 1;
    var resultsPerPage = req.query.resultsPerPage || 5;
    var skipFrom = (pageNumber * resultsPerPage) - resultsPerPage;
    model.posts.count({}, function (err, c) {
        if (c % resultsPerPage) {
            pages_count = c / resultsPerPage + 1;

        } else {
            pages_count = c / resultsPerPage;

        }

        model.posts.find().skip(skipFrom).limit(resultsPerPage).populate('image').sort('-date').exec(function (err, posts) {
            console.log(posts);
            res.render('posts', {posts: posts, pages_count: pages_count})
        });

    })

});
router.get('/category', function (req, res, next) {
    res.redirect('/posts');

});
router.get('/category/:catname', function (req, res, next) {
    var pages_count;
    var catname = req.params.catname;
    var pageNumber = req.query.page || 1;
    var resultsPerPage = req.query.resultsPerPage || 2;
    var skipFrom = (pageNumber * resultsPerPage) - resultsPerPage;

    model.posts.count({category: catname}, function (err, c) {
        if (c % resultsPerPage) {
            pages_count = c / resultsPerPage + 1;

        } else {
            pages_count = c / resultsPerPage;

        }

        model.posts.find({category: catname}).skip(skipFrom).limit(resultsPerPage).sort('-date').exec(function (err, posts) {
            res.render('category', {posts: posts, pages_count: pages_count});
        })
    });
});
router.get('/create', function (req, res, next) {
    var postId = req.query.id;

    model.posts.find({_id: postId}, function (err, post) {
        if (post.length > 0) {
            res.render('new_post', {post: post});
        } else {
            res.render('new_post');
        }
    })

});
router.get('/:postId', function (req, res, next) {

    var postId = req.params.postId;

    model.posts.find({_id: postId}, function (err, post) {
        if (post) {
            res.render('post', {post: post});
        } else {
            res.sendStatus(404);
        }
    });

});

router.post('/', function (req, res, next) {
    var busboy = new Busboy({headers: req.headers});
    var post = [];
    var images;
    busboy.on('field', function (key, val, keyTrunc, valTrunc, encoding, contype) {
        post[key] = val;
    });
    busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {

        file.pipe(fs.createWriteStream('public/images/' + filename));
        images = new model.images({
            name: filename,
            path: '/images/' + filename
        });
        images.save(function () {
        });


    });
    busboy.on('finish', function () {

        if (images) {
            var posts = new model.posts({
                title: post['title'],
                body: post['body'],
                excerption: post['excerption'],
                category: post['category'],
                image: images._id
            })
        } else {
            var posts = new model.posts({
                title: post['title'],
                body: post['body'],
                excerption: post['excerption'],
                category: post['category']
            })
        }
        posts.save(function () {

            res.send({id: posts['_id']})
        })


    });

    req.pipe(busboy);

});

router.put('/:postId', function (req, res, next) {

    var post = req.body;
    var postId = req.params.postId;


    model.posts.update({_id: postId}, post, function (err, result) {
        if (err) return handleError(err);
        res.send(result);
    })
});


router.delete('/:postId', function (req, res, next) {
    var postId = req.params.postId;

    model.posts.remove({_id: postId}, function (err, result) {
        res.send(result);
    })
});
module.exports = router;
