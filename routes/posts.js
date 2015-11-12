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

    posts_model.find({_id: postId}, function (err, post) {
        if (post.length > 0) {
            res.render('new_post', {post: post});
        } else {
            res.render('new_post');
        }
    });

});
router.get('/:postId', function (req, res, next) {

    var postId = req.params.postId;
    posts_model.find({_id: postId}, function (err, post) {
        if (post.length > 0) {
            res.render('post', {post: post});
        } else {
            res.send('POST NOT FOUND');
        }
    });
});


router.post('/', function (req, res, next) {

    var post = req.body;

        var posts = new posts_model({title: post.title,body: post.body, excerption:post.excerption});
        posts.save(function () {
           res.send({id:posts.id});
        });


});

router.put('/:postId', function (req, res, next) {

    var post = req.body;
    var postId = req.params.postId;

    if (postId) {
        posts_model.update({_id: postId}, post, function (err, raw) {
            if (err) return handleError(err);
            if (raw.nModified) {
                res.send({message:'Post updated by ',id: postId});
            } else {
                res.send({message:'Post not modificated'});
            }
        })
    } else {
        res.send({message:'Post not found'});
    }

});

router.delete('/:postId', function (req, res, next) {
    var postId = req.params.postId;

    posts_model.remove({_id: postId}, function (err, post) {
        if (post.result.n) {
            console.log(post.result.n);
            res.send({message:'Post deleted by ',id: postId});
        } else {
            res.send({message:'Post not found'});
        }
    })
});

module.exports = router;
