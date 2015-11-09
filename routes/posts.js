var express = require('express');
var router = express.Router();
var posts_model = require('../model/db');
/* GET users listing. */
router.get('/', function (req, res, next) {
    posts_model.find(function (err, posts) {
        res.render('posts', {posts: posts});
    });
});
router.get('/create', function (req, res, next) {
    var postId = req.param('id');

    posts_model.find({id: postId}, function (err, post) {
        if (post.length > 0) {
            res.render('new_post', {post: post});
        } else {
            res.render('new_post');
        }
    });

});
router.get('/:postId', function (req, res, next) {

    var postId = req.params.postId;
    posts_model.find({id: postId}, function (err, post) {
        if (post.length > 0) {
            res.render('post', {post: post});
        } else {
            res.send('POST NOT FOUND');
        }
    });
});


router.post('/', function (req, res, next) {

    var post = req.body;
    posts_model.find({}, 'id', function (err, doc) {

        var count;
        if (doc.length > 0) {

            var min = doc[0].id;
            var max = min;
            for (var i = 0; i < doc.length; ++i) {
                if (doc[i].id > max) max = doc[i].id;
                if (doc[i].id < min) min = doc[i].id;
            }
            count = max + 1;
        } else {
            count = 1;
        }
        var posts = new posts_model({title: post.title, id: count, body: post.body, excerption:post.excerption});
        posts.save(function () {
            res.send({id: count})
        });
    });

});

router.put('/:postId', function (req, res, next) {

    var post = req.body;
    var postId = req.params.postId;

    if (postId) {
        posts_model.update({id: postId}, post, function (err, raw) {
            if (err) return handleError(err);
            if (raw.nModified) {
                res.send({id: postId});
            } else {
                res.send('Not Modified');
            }
        })
    } else {
        res.send('Not found');
    }

});

router.delete('/:postId', function (req, res, next) {
    var postId = req.params.postId;

    posts_model.remove({id: postId}, function (err, post) {
        if (post.result.n) {
            console.log(post.result.n);
            res.send({id: postId});
        } else {
            res.send('Not found ')
        }
    })
});

module.exports = router;
