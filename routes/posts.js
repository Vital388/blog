var express = require('express');
var router = express.Router();
var posts_model = require('../model/db');
/* GET users listing. */
router.get('/', function (req, res, next) {
    /*var query, skipFrom, sort, columns, populate, lean, model = this;
    columns = options.columns || null;
    sort = options.sort || options.sortBy || null; // todo: get rid of sortBy in major version
    populate = options.populate || null;
    var lean = options.lean || false;
    var pageNumber = options.page || 1;
    var resultsPerPage = options.limit || 10;
    skipFrom = (pageNumber * resultsPerPage) - resultsPerPage;
    query = model.find(q);
    if (columns !== null) {
        query = query.select(options.columns);
    }
    query = query.skip(skipFrom).limit(resultsPerPage);
    if (sort !== null) {
        query.sort(sort);
    }
    if (populate) {
        if (Array.isArray(populate)) {
            populate.forEach(function(field) {
                query = query.populate(field);
            });
        } else {
            query = query.populate(populate);
        }
    }
    if (lean) {
        query.lean();
    }

    if (typeof callback === 'function') {
        return handleCallback(query, q, model, resultsPerPage, callback);
    } else {
        return handlePromise(query, q, model, resultsPerPage);
    }
}

*/
    var pages_count;
    var pageNumber = req.query.page || 1;
    var resultsPerPage = req.query.resultsPerPage||5;
    var skipFrom = (pageNumber * resultsPerPage) - resultsPerPage;
    posts_model.count({},function(err,c){
        pages_count=c/resultsPerPage;
        console.log(pages_count);
        posts_model.find().skip(skipFrom).limit(resultsPerPage).sort('-date').exec(function (err, posts) {
            res.render('posts', {posts: posts,pages_count:pages_count});
        })
    });


});
router.get('/category/:catname', function (req, res, next) {
    var pages_count;
    var catname = req.params.catname;
    var pageNumber = req.query.page || 1;
    var resultsPerPage = req.query.resultsPerPage||2;
    var skipFrom = (pageNumber * resultsPerPage) - resultsPerPage;
    console.log(catname.length);
    if(catname.length>0){
    posts_model.count({category:catname},function(err,c){
        pages_count=c/resultsPerPage;
        console.log(pages_count);
        posts_model.find({category:catname}).skip(skipFrom).limit(resultsPerPage).sort('-date').exec(function (err, posts) {
            res.render('category', {posts: posts,pages_count:pages_count});
        })
    });
    }else{
      res.send(404);
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
    if(postId.length>0){
    posts_model.find({_id: postId}, function (err, post) {
        if (post.length > 0) {
            res.render('post', {post: post});
        } else {
            next();
        }
    })
    }
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
