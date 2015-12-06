var express = require('express');
var router = express.Router();
var model = require('../../model/db');
var fs = require('fs');
var multiparty = require('multiparty');
var Crypto=require('../../random');
/* GET users listing. */


router.get('/', function (req, res, next) {

    var pages_count=0;
    var pageNumber = req.query.page || 1;
    var resultsPerPage = req.query.resultsPerPage || 5;
    var skipFrom = (pageNumber * resultsPerPage) - resultsPerPage;
    model.posts.count({}, function (err, c) {
        if (c % resultsPerPage) {

            pages_count = c / resultsPerPage + 1;

        } else {
            pages_count = c / resultsPerPage;

        }

        model.posts.find().skip(skipFrom).limit(resultsPerPage).populate('image').sort('-date').exec(function (err, data) {

            res.json({posts: data, pages_count: pages_count})
        });

    })

});
router.get('/category', function (req, res, next) {
    res.redirect('/posts');

});
router.get('/category/:catname', function (req, res, next) {
    var pages_count=0;
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

        model.posts.find({category: catname}).skip(skipFrom).limit(resultsPerPage).populate('image').sort('-date').exec(function (err, data) {
            res.json({posts: data, pages_count: pages_count});
        })
    });
});
router.get('/create', function (req, res, next) {
    var postId = req.query.id;
    model.posts.findOne({_id: postId},function (err, data) {
            if (!err) {
                res.render('new_post', {post: data});
            } else {
                res.render('new_post');
            }

    })

});
router.get('/:postId', function (req, res, next) {

    var postId = req.params.postId;


    model.posts.findOne({_id: postId}).populate('image').exec(function (err, data) {
        if (data) {

            res.json({post: data});
        } else {

            res.sendStatus(404);
        }
    });

})
;

router.post('/', function (req, res, next) {

    var form = new multiparty.Form({autoFields: false, autoFiles: false});
    var post = [];
    var images;
    var posts;
    var maxSize = 2000000;
    form.on('close', function () {
        if (images) {
            posts = new model.posts({
                title: post['title'],
                body: post['body'],
                excerption: post['excerption'],
                category: post['category'],
                image: images._id
            });
            posts.save(function () {

                images._post = posts._id;
                images.save();

                res.send({id: posts['_id']})
            })
        } else {
            posts = new model.posts({
                title: post['title'],
                body: post['body'],
                excerption: post['excerption'],
                category: post['category']
            });
            posts.save(function () {

                res.send({id: posts['_id']})
            })
        }

    });
    form.on('error', function (err) {
        console.log('Error parsing form: ' + err.stack);
    });
    form.on('field', function (name, value) {
        post[name] = value;
    });
    form.on('part', function (part) {
        if (part.filename && part.byteCount <= maxSize) {
            var name = Crypto.randoName(part.filename);
            part.pipe(fs.createWriteStream('public/images/' + name));

            images = new model.images({
                name: part.filename,
                path: '/images/' + name,
                size: part.byteCount
            });

        } else {
            part.resume();
        }
    });

    form.parse(req);


});

router.put('/:postId', function (req, res, next) {
    var postId = req.params.postId;

    var form = new multiparty.Form({autoFields: false, autoFiles: false});
    var post = [];
    var maxSize = 2000000;
    var images;
    form.on('close', function () {
        if (images) {
            model.posts.update({_id: postId}, {
                title: post['title'],
                body: post['body'],
                excerption: post['excerption'],
                category: post['category'],
                image: images._id
            }, function (err, result) {
                if (err) return handleError(err);
                res.json(result);
            })

        } else {

            model.posts.update({_id: postId}, {
                title: post['title'],
                body: post['body'],
                excerption: post['excerption'],
                category: post['category']
            }, function (err, result) {
                if (err) return handleError(err);
                res.json(result);
            })
        }

    });
    form.on('error', function (err) {
        console.log('Error parsing form: ' + err.stack);
    });
    form.on('field', function (name, value) {
        post[name] = value;
    });
    form.on('part', function (part) {
        if (part.filename && part.byteCount <= maxSize) {
            model.images.findOne({_post: postId}, function (err, data) {
                if (data) {
                    data.size = part.byteCount;
                    data.save();
                    part.pipe(fs.createWriteStream('public/' + data.path));
                } else {
                    var name = Crypto.randoName(part.filename);
                    part.pipe(fs.createWriteStream('public/images/' + name));

                    images = new model.images({
                        _post: postId,
                        name: name,
                        path: '/images/' + name,
                        size: part.byteCount
                    });
                    images.save();

                }
            })
        } else {
            part.resume();
        }
    });

    form.parse(req);

});


router.delete('/:postId', function (req, res, next) {
    var postId = req.params.postId;
    model.posts.remove({_id: postId}, function (err, result) {
        res.json(result);
    });
    model.images.findOne({_post: postId}, function (err, data) {
        if(data){
        model.images.remove({_post: postId}, function (err, result) {
            fs.exists('public/' + data.path, function (exists) {
                if(exists){
                    fs.unlinkSync('public/' + data.path);
                }
            });

        });
        }
    });

});
module.exports = router;
