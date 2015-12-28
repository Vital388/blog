var express = require('express');
var router = express.Router();
var model = require('../../model/db');
var fs = require('fs');
var multiparty = require('multiparty');
var Crypto = require('../../lib/random');
var ensureAuthenticated = require('../../lib/auth');
var accessRight = require('../../lib/accessRight');
var s3obj = require('../../lib/amazonS3');


/* GET users listing. */


router.get('/categories/:catname', function (req, res, next) {
    console.log('catname =' + req.params.catname)
    var pages_count = 0;
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
router.get('/categories', function (req, res, next) {

    model.categories.find().exec(function (err, data) {
        res.json(data);
    })


});
router.get('/:postId', function (req, res, next) {

    var postId = req.params.postId;


    model.posts.findOne({_id: postId}).populate('image').exec(function (err, post) {
        if (post) {

            res.json(post);
        } else {

            res.sendStatus(404);
        }
    });

});
router.get('/author/:username', function (req, res, next) {

    var username = req.params.username;
    var pages_count = 0;
    var pageNumber = req.query.page || 1;
    var resultsPerPage = req.query.resultsPerPage || 5;
    var skipFrom = (pageNumber * resultsPerPage) - resultsPerPage;
    model.posts.count({}, function (err, c) {
        if (c % resultsPerPage) {

            pages_count = c / resultsPerPage + 1;

        } else {
            pages_count = c / resultsPerPage;

        }

        model.posts.find({author: username}).skip(skipFrom).limit(resultsPerPage).populate('image').sort('-date').exec(function (err, data) {
            res.json({posts: data, pages_count: pages_count})
        });

    })

});
router.get('/', function (req, res, next) {

    var pages_count = 0;
    var pageNumber = req.query.page || 1;
    var resultsPerPage = req.query.resultsPerPage || 5;
    var skipFrom = (pageNumber * resultsPerPage) - resultsPerPage;
    model.posts.count({}, function (err, c) {
        if (c % resultsPerPage) {

            pages_count = c / resultsPerPage + 1;

        } else {
            pages_count = c / resultsPerPage;

        }

        model.posts.find().skip(skipFrom).limit(resultsPerPage).populate('image','path').populate('author','nickname').sort('-date').exec(function (err, data) {
            res.json({posts: data, pages_count: pages_count})
        });

    })

});

router.post('/', ensureAuthenticated, function (req, res, next) {

    var form = new multiparty.Form({autoFields: false, autoFiles: false});
    var post = [];
    var posts;
    var categories;
    form.on('close', function () {
        console.log(post['title'])
        categories = new model.categories({
            name: post['category']
        });
        categories.save();
        posts = new model.posts({
            author: req.user._id,
            title: post['title'],
            body: post['body'],
            excerption: post['excerption'],
            category: post['category']
        });
        posts.save(function (err) {
            if(err) console.log(err);
            res.json({
                access: true,
                postID: posts._id
            })
        })


    });
    form.on('error', function (err) {
        console.log('Error parsing form: ' + err.stack);
    });
    form.on('field', function (name, value) {
        post[name] = value;
    });


    form.parse(req);


})
;

router.put('/:postId', ensureAuthenticated,accessRight.accessRightPost, function (req, res, next) {
    var postId = req.params.postId;

    var form = new multiparty.Form({autoFields: false, autoFiles: false});
    var post = [];

    form.on('close', function () {

                model.posts.update({_id: postId}, {
                    title: post['title'],
                    body: post['body'],
                    excerption: post['excerption'],
                    category: post['category']
                }, function (err, result) {
                    if (err) {
                        return handleError(err);
                    } else {

                        res.json({access: true})
                    }
                })

        })
    form.on('error', function (err) {
        console.log('Error parsing form: ' + err.stack);
    });
    form.on('field', function (name, value) {
        post[name] = value;
    });


    form.parse(req);

})
;


router.delete('/:postId', ensureAuthenticated,accessRight.accessRightPost, function (req, res, next) {
    var postId = req.params.postId;
    model.posts.remove({_id: postId}, function (err, result) {
        if (err) {
            return handleError(err);
        } else {

            res.json({access: true})
        }
    });

});
router.post('/image/:postId', ensureAuthenticated,accessRight.accessRightPost, function (req, res, next) {
    var postId = req.params.postId;
    var images;
    var maxSize = 5000000;
    model.posts.findOne({_id: postId}, function (err, post) {
        if (!post) {
            res.json({access: false})
        } else {
            model.images.findOne({_post: postId}, function (err, image) {
                if (image) {
                    res.json({access: false})
                } else {
                    var form = new multiparty.Form({autoFields: false, autoFiles: false});

                    form.on('error', function (err) {
                        console.log('Error parsing form: ' + err.stack);
                    });

                    form.on('part', function (part) {
                        if (part.filename && part.byteCount <= maxSize) {
                            var name = Crypto.randoName(part.filename);
                            var params = {Key: 'images/' + name, Body: part, ContentType: part.headers['content-type']};
                            s3obj.upload(params).
                                on('httpUploadProgress', function (evt) {
                                    console.log(evt);
                                }).
                                send(function (err, data) {
                                    if (!err) {
                                        images = new model.images({
                                            _post: postId,
                                            name: name,
                                            path: data.Location,
                                            size: part.byteCount
                                        });
                                        images.save(function () {
                                            model.posts.update({_id: postId}, {
                                                image: images._id

                                            }, function (err, result) {
                                                console.log(err);
                                                console.log(result);

                                                res.json({
                                                    access: true,
                                                    image: images.path
                                                })

                                            })

                                        })


                                    }else{
                                        console.log(err)
                                    }
                                })
                        }
                        else {
                            part.resume();
                        }
                    })

                    form.parse(req);
                }

            })
        }
    })

})
router.delete('/image/:postId', ensureAuthenticated,accessRight.accessRightImage, function (req, res, next) {
    var postId = req.params.postId;
    model.images.findOneAndRemove({_post: postId}, function (err, image) {
        if (image) {
            s3obj.deleteObject({Key: 'images/' + image.name}, function (err, data) {
                if (err) {
                    console.log(err, err.stack);
                } // an error occurred
                else {

                    console.log(data);
                    res.json({access: true});
                }           // successful response
            })
        } else {
            res.json({access: false});
        }

    })


})
module.exports = router;
