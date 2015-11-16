var express = require('express');
var router = express.Router();
var posts_model = require('../model/db');
/* GET users listing. */
router.get('/:postId', function (req, res, next) {

    var postId = req.params.postId;

    posts_model.find({_id: postId}, function (err, post) {
        if (post) {
            res.render('post', {post: post});
        } else {
            res.sendStatus(404);
        }
    });

});
router.get('/', function (req, res, next) {
    var pages_count;
    var pageNumber = req.query.page || 1;
    var resultsPerPage = req.query.resultsPerPage || 5;
    var skipFrom = (pageNumber * resultsPerPage) - resultsPerPage;
    posts_model.count({}, function (err, c) {
        if (c % resultsPerPage) {
            pages_count = c / resultsPerPage + 1;

        } else {
            pages_count = c / resultsPerPage;

        }

        posts_model.find().skip(skipFrom).limit(resultsPerPage).sort('-date').exec(function (err, posts) {
            res.render('posts', {posts: posts, pages_count: pages_count});
        })
    });


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

    posts_model.count({category: catname}, function (err, c) {
        if (c % resultsPerPage) {
            pages_count = c / resultsPerPage + 1;

        } else {
            pages_count = c / resultsPerPage;

        }

        posts_model.find({category: catname}).skip(skipFrom).limit(resultsPerPage).sort('-date').exec(function (err, posts) {
            res.render('category', {posts: posts, pages_count: pages_count});
        })
    });
});
router.get('/create', function (req, res, next) {
    var postId = req.query.id;

    posts_model.find({_id: postId}, function (err, post) {
        if (post.length > 0) {
            res.render('new_post', {post: post});
        } else {
            res.render('new_post');
        }
    })

});


router.post('/', function (req, res, next) {

    var post = req.body;

    var posts = new posts_model({
        title: post.title,
        body: post.body,
        excerption: post.excerption,
        category: post.category
    });
    posts.save(function () {
        res.send({id: posts.id});
    })


});

router.put('/:postId', function (req, res, next) {

    var post = req.body;
    var postId = req.params.postId;


    posts_model.update({_id: postId}, post, function (err, result) {
        if (err) return handleError(err);
        res.send(result);
    })
});


router.delete('/:postId', function (req, res, next) {
    var postId = req.params.postId;

    posts_model.remove({_id: postId}, function (err, result) {
        res.send(result);
    })
});
module.exports = router;
