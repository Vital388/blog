var express = require('express');
var router = express.Router();
var posts_model = require('../model/db');
/* GET users listing. */
router.get('/', function (req, res, next) {
    var category = req.query.category;
    if(category){
        posts_model.find({category:category}).sort('-date').exec(function (err, posts) {
            res.render('posts', {posts: posts});
        })
    }else{
    posts_model.find().sort('-date').exec(function (err, posts) {
        res.render('posts', {posts: posts});
    })
    }
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
router.get('/:postId', function (req, res, next) {

    var postId = req.params.postId;
    posts_model.find({_id: postId}, function (err, post) {
        if (post) {
            res.render('post', {post: post});
        } else {
            next();
        }
    })
});


router.post('/', function (req, res, next) {

    var post = req.body;

    var posts = new posts_model({title: post.title, body: post.body, excerption: post.excerption,category:post.category});
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
