var express = require('express');
var router = express.Router();
var model = require('../model/db');
var Busboy = require('busboy');
var crypto = require('crypto');
var fs = require('fs');
var multiparty = require('multiparty');
var path = require('path');
/* GET users listing. */
var b64Safe = {'/': '_', '+': '-'};
var FILE_EXT_RE = /(\.[_\-a-zA-Z0-9]{0,16}).*/;
function randoName(filename) {
    var ext = path.extname(filename).replace(FILE_EXT_RE, '$1');
    var name = randoString(18) + ext;
    return name;
}

function randoString(size) {
    return rando(size).toString('base64').replace(/[\/\+]/g, function (x) {
        return b64Safe[x];
    });
}

function rando(size) {
    try {
        return crypto.randomBytes(size);
    } catch (err) {
        return crypto.pseudoRandomBytes(size);
    }
}


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
            var name = randoName(part.filename);
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
                res.send(result);
            })

        } else {

            model.posts.update({_id: postId}, {
                title: post['title'],
                body: post['body'],
                excerption: post['excerption'],
                category: post['category']
            }, function (err, result) {
                if (err) return handleError(err);
                res.send(result);
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
                    var name = randoName(part.filename);
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
        res.send(result);
    });
    model.images.findOne({_post: postId}, function (err, data) {
        model.images.remove({_post: postId}, function (err, result) {
            fs.unlinkSync('public/' + data.path);
        });
    });

});
module.exports = router;
